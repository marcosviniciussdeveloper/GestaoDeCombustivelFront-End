import React, { useState } from "react";
import { useAuth } from "../providers/authProvider";
import { EyeIcon } from "../components/icons/EyeIcon";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Função para lidar com a submissão do formulário
  const onSubmit = async (e: React.FormEvent) => {
    // Previne o recarregamento padrão da página
    e.preventDefault();

    setErr("");
    setLoading(true);
    try {
      await login(email, senha);
      // O redirecionamento após o sucesso é tratado pelo AuthProvider
    } catch (error: any) {
      // Mostra uma mensagem de erro para o usuário
      setErr(error?.message || "Falha ao autenticar. Verifique suas credenciais.");
    } finally {
      // Garante que o estado de loading é desativado no final
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">⛽</div>
        <h1 className="login-title">Gestão de Combustível</h1>
        <p className="login-sub">Acesse sua conta para continuar</p>

        {err && <div className="login-error">{err}</div>}

        <form className="login-form" onSubmit={onSubmit}>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group password-wrapper">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              disabled={loading}
            >
              <EyeIcon isVisible={isPasswordVisible} />
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
