import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
type User = { nome: string; tipoUsuario: string; empresaId: string | number | null };
type AuthState = { token: string; user: User | null };

type NewType = {
    token: string | null;
    user: User | null;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

type Ctx = NewType;

const LS_KEY = "gc_auth_v1";
const AuthContext = createContext<Ctx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: "", user: null });

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setState(JSON.parse(saved));
  }, []);
const login = async (email: string, senha: string) => {
  const res = await api.signIn(email, senha); // 
  const next: AuthState = {
    token: res.data.token,
    user:  res.data.user,
  };
  setState(next);
  localStorage.setItem(LS_KEY, JSON.stringify(next));
};

  const logout = () => {
    setState({ token: "", user: null });
    localStorage.removeItem(LS_KEY);
  };

  const value = useMemo<Ctx>(() => ({
    token: state.token || null,
    user: state.user,
    login,
    logout,
    isAuthenticated: !!state.token
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
