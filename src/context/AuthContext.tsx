"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthState } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextProps {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    erro: null,
    loading: true,
  });
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: {
            uid: session.user.id,
            email: session.user.email || null,
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              null,
            photoURL:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture ||
              null,
          },
          erro: null,
          loading: false,
        });
      } else {
        setAuthState({ user: null, erro: null, loading: false });
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            uid: session.user.id,
            email: session.user.email || null,
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              null,
            photoURL:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture ||
              null,
          },
          erro: null,
          loading: false,
        });
      } else {
        // Limpar cache quando usuário faz logout
        queryClient.clear();
        setAuthState({ user: null, erro: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, erro: null }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login!";
      setAuthState((prev) => ({ ...prev, loading: false, erro: message }));
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, erro: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "",
            full_name: name || "",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Se o trigger não criar automaticamente, criar manualmente
      // O trigger do Supabase deve criar, mas isso é um fallback
      if (data.user) {
        try {
          await fetch("/api/user/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email || email,
              name: name,
            }),
          });
        } catch (createError) {
          // Ignorar erro - o trigger pode já ter criado
          console.log(
            "Erro ao criar usuário (pode ser normal se o trigger funcionou):",
            createError
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar conta!";
      setAuthState((prev) => ({ ...prev, loading: false, erro: message }));
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Limpar cache do React Query ao fazer logout
      queryClient.clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deslogar!";
      setAuthState((prev) => ({ ...prev, loading: false, erro: message }));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
