import { supabase } from "@/lib/supabase";

type LoginResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
};

export async function loginUser(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  try {
    // 1️⃣ Chamar a função RPC no Supabase
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

    // 2️⃣ Verificação básica da resposta
    if (!data || data.success !== true || !data.user) {
      return {
        success: false,
        error: data?.error || "Credenciais incorretas",
      };
    }

    // 3️⃣ EXTRAIR O USER CORRETAMENTE (AQUI ESTAVA O ERRO)
    const user = data.user;

    if (!user.id) {
      console.error("User sem ID:", user);
      return {
        success: false,
        error: "Utilizador inválido",
      };
    }

    // 4️⃣ Guardar sessão/localStorage (ajusta se usares outro método)
    localStorage.setItem(
      "desperto_user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      })
    );

    // 5️⃣ Retorno final
    return {
      success: true,
      user,
    };
  } catch (err) {
    console.error("Erro inesperado no login:", err);
    return {
      success: false,
      error: "Erro inesperado",
    };
  }
}
