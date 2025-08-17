import { useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api";

// --- TIPOS DE DADOS ---
type User = {
  nome?: string;
  tipoUsuario?: string;
  empresaId?: number | string | null;
};

type AuthState = {
  token: string | null; // Permitir null para o estado inicial
  user: User | null;
};

// --- TIPO DO CONTEXTO (CORRIGIDO) ---
type AuthContextType = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // Corrigido para 'isLoading' (minúsculo) e não opcional
};

// --- CONFIGURAÇÃO DO CONTEXTO ---
const LS_KEY = "gc_auth_v1";
const AuthCtx = createContext<AuthContextType | null>(null);

// --- COMPONENTE PROVIDER (COM LÓGICA DE ISLOADING) ---
export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Ajustamos o estado inicial para permitir null
  const [state, setState] = useState<AuthState>({ token: null, user: null });
  // 2. Criamos o estado para controlar o carregamento inicial
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Efeito para carregar a sessão salva APENAS UMA VEZ
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(LS_KEY);
      if (savedSession) {
        setState(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error("Falha ao ler a sessão do localStorage.", e);
      localStorage.removeItem(LS_KEY);
    } finally {
      // 3. Independentemente do resultado, o carregamento inicial terminou
      setIsLoading(false);
    }
  }, []); // O array de dependências vazio [] garante que isto só executa uma vez

  // --- FUNÇÃO DE LOGIN ---
  const login = async (email: string, senha: string) => {
    const { data } = await api.signIn(email, senha);

    if (!data || !data.user) {
      throw new Error("A resposta da API de login está incompleta.");
    }

    const userData: User = {
      nome: data.user.nome,
      tipoUsuario: data.user.tipoUsuario, // Supondo que a API retorna 'tipoUsuario'
      empresaId: data.user.empresaId,
    };

    if (!userData.empresaId) {
      throw new Error("Login falhou: 'empresaId' não foi retornado pela API.");
    }

    const nextState: AuthState = {
      token: data.token,
      user: userData,
    };

    setState(nextState);
    localStorage.setItem(LS_KEY, JSON.stringify(nextState));
    navigate("/app"); // ou a sua rota principal
  };

  // --- FUNÇÃO DE LOGOUT ---
  const logout = () => {
    setState({ token: null, user: null });
    localStorage.removeItem(LS_KEY);
    navigate("/login");
  };

  // --- VALOR DO CONTEXTO (COM ISLOADING) ---
  const value = useMemo<AuthContextType>(
    () => ({
      token: state.token,
      user: state.user,
      isAuthenticated: !!state.token,
      login,
      logout,
      isLoading, // 4. Passamos o estado 'isLoading' para o contexto
    }),
    [state, isLoading] // 5. Adicionamos 'isLoading' às dependências do useMemo
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// --- HOOK PERSONALIZADO ---
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("O hook useAuth deve ser usado dentro de um AuthProvider.");
  }
  return ctx;
}
