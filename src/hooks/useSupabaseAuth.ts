import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export type AuthResponse = {
  success: boolean;
  error?: string;
  user?: AuthUser;
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

      // Erro de RPC
      if (error) {
        console.error("Erro RPC:", error);
        return {
          success: false,
          error: "Erro interno do servidor",
        };
      }

      // Credenciais inválidas ou resposta inesperada
      if (!data || data.success !== true || !data.user) {
        return {
          success: false,
          error: data?.error || "Credenciais incorretas",
        };
      }

      const user = data.user;

      // 🔴 ESTE ERA O ERRO: agora usamos user.id (não user.user_id)
      if (!user.id) {
        console.error("User sem ID:", user);
        return {
          success: false,
          error: "Utilizador inválido",
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
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

  return {
    signIn,
  };
}
