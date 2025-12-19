import { supabase } from "@/lib/supabase";

type AuthResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    userType: string;
    fullName: string;
  };
};

export function useSupabaseAuth() {
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

      if (!data || data.success !== true || !data.user) {
        return {
          success: false,
          error: data?.error || "Credenciais incorretas",
        };
      }

      const user = data.user;

      if (!user.id) {
        console.error("User sem ID:", user);
        return {
          success: false,
          error: "Utilizador inválido",
        };
      }

      localStorage.setItem(
        "desperto_user",
        JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.user_type,
        })
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.user_type,
          fullName: user.full_name || user.username,
        },
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
      // Register new user
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          username,
          email,
          password_hash: password, // Should be hashed by trigger
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

      // Create user profile
      await supabase.from("user_profiles").insert({
        user_id: userData.id,
        full_name: fullName,
        phone: phone,
      });

      localStorage.setItem(
        "desperto_user",
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          userType: userData.user_type,
        })
      );

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          userType: userData.user_type,
          fullName,
        },
      };
    } catch (err) {
      console.error("Erro inesperado no registo:", err);
      return {
        success: false,
        error: "Erro inesperado",
      };
    }
  };

  return {
    signIn,
    signUp,
  };
}
