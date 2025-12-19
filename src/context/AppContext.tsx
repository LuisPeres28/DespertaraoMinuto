import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSupabaseAuth, AuthUser } from "@/hooks/useSupabaseAuth";

type AppContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loadingAuth: boolean;
  signIn: (identifier: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { signIn: supabaseSignIn } = useSupabaseAuth();

  const [user, setUser] = useLocalStorage<AuthUser | null>("auth_user", null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const isAuthenticated = !!user;

  const signIn = async (identifier: string, password: string) => {
    setLoadingAuth(true);

    try {
      const result = await supabaseSignIn(identifier, password);

      if (!result.success || !result.user) {
        setUser(null);
        return {
          success: false,
          error: result.error || "Erro ao autenticar",
        };
      }

      // 🔑 AQUI ESTAVA O ERRO ANTIGO (user_id)
      // O RPC devolve `id`
      const authenticatedUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
      };

      setUser(authenticatedUser);

      return { success: true };
    } catch (err) {
      console.error("Erro inesperado no signIn:", err);
      setUser(null);
      return {
        success: false,
        error: "Erro inesperado",
      };
    } finally {
      setLoadingAuth(false);
    }
  };

  const signOut = () => {
    setUser(null);
  };

  useEffect(() => {
    // apenas para garantir consistência no arranque
    if (!user) return;
    if (!user.id) {
      console.warn("User inválido no storage, a limpar sessão");
      setUser(null);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        loadingAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext deve ser usado dentro de AppProvider");
  }
  return context;
}

export const useApp = useAppContext;
