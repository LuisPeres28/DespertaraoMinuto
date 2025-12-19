import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  userType?: string;
  fullName?: string;
};

export type AuthResponse = {
  success: boolean;
  error?: string;
  user?: AuthUser;
};

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("desperto_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar utilizador:", error);
        localStorage.removeItem("desperto_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (
    identifier: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.rpc("authenticate_user", {
        p_identifier: identifier,
        p_password: password,
      });

      if (error) {
        console.error("Erro RPC:", error);
        return {
          success: false,
          error: "Erro interno do servidor",
        };
      }

      let result = data;

      // Se data é uma string, fazer parse
      if (typeof data === 'string') {
        try {
          result = JSON.parse(data);
        } catch (e) {
          console.error("Erro ao fazer parse do JSON:", e);
          return {
            success: false,
            error: "Erro ao processar resposta",
          };
        }
      }

      if (!result || result.success !== true || !result.user) {
        return {
          success: false,
          error: result?.error || "Credenciais incorretas",
        };
      }

      const dbUser = result.user;

      if (!dbUser.id) {
        return {
          success: false,
          error: "Utilizador inválido",
        };
      }

      const authenticatedUser: AuthUser = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        role: dbUser.user_type,
        userType: dbUser.user_type,
        fullName: dbUser.full_name || dbUser.username,
      };

      localStorage.setItem("desperto_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return {
        success: true,
        user: authenticatedUser,
      };
    } catch (err) {
      console.error("Erro inesperado no login:", err);
      return {
        success: false,
        error: "Erro inesperado",
      };
    }
  };

  const signUp = async (
    username: string,
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<AuthResponse> => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          username,
          email,
          password_hash: password,
          user_type: "client",
          phone_number: phone,
        })
        .select()
        .single();

      if (userError) {
        console.error("Registration error:", userError);
        return {
          success: false,
          error: "Erro ao criar conta. Username ou email já existem.",
        };
      }

      await supabase.from("user_profiles").insert({
        user_id: userData.id,
        full_name: fullName,
        phone: phone,
      });

      const authenticatedUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.user_type,
        userType: userData.user_type,
        fullName,
      };

      localStorage.setItem("desperto_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return {
        success: true,
        user: authenticatedUser,
      };
    } catch (err) {
      console.error("Erro inesperado no registo:", err);
      return {
        success: false,
        error: "Erro inesperado",
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("desperto_user");
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
