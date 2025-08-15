import * as reactRouterDom from "react-router-dom";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "../api";

type AuthLocal = {
  accessToken?: string;
  token?: string;
  user?: {
    nome?: string;
    tipoUsuario?: string;
    empresaId?: number | string | null;
  };
};

export default function Login() {
  const navigate = reactRouterDom.useNavigate();
  const [params] = reactRouterDom.useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const e = params.get("email");
    const s = params.get("senha");
    if (e) setEmail(e);
    if (s) setSenha(s);
  }, [params]);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && senha.length >= 4 && !loading,
    [email, senha, loading]
  );

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.signIn(email.trim(), senha);
     
      const sess: AuthLocal = {
        accessToken: data?.accessToken || data?.token,
        token: data?.accessToken || data?.token,
        user: {
          nome: data?.usuario?.nome,
          tipoUsuario: data?.usuario?.tipoUsuario,
          empresaId:
            (data?.usuario?.empresaId as number | string | null) ??
            (data as any)?.empresaId ??
            null,
        },
      };
      localStorage.setItem("auth", JSON.stringify(sess));

      
      const next = params.get("next") || "/";
      navigate(next, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Falha ao autenticar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={styles.page}>
      <form onSubmit={onSubmit} className="login-card" style={styles.card}>
        <div style={styles.header}>
          <span style={styles.emoji}>⛽</span>
          <h1 style={styles.title}>Gestão de Combustível</h1>
          <p style={styles.subtitle}>Acesse sua conta para continuar</p>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              style={{ ...styles.input, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              style={styles.toggle}
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{ ...styles.button, opacity: canSubmit ? 1 : 0.6 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

/* estilos inline leves para não depender de mais CSS agora */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(220,53,69,.12), rgba(248,249,250,1) 50%, #fff)",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    border: "1px solid #e9ecef",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 10px 24px rgba(220,53,69,.08)",
  },
  header: { textAlign: "center", marginBottom: 16 },
  emoji: { fontSize: 28, display: "block" },
  title: { margin: "6px 0 4px", color: "#dc3545", fontSize: 24 },
  subtitle: { margin: 0, color: "#6c757d", fontSize: 14 },
  group: { marginTop: 12 },
  label: { display: "block", marginBottom: 6, color: "#495057", fontWeight: 600 },
  input: {
    width: "100%",
    height: 44,
    border: "1px solid #ced4da",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 16,
    outline: "none",
  },
  toggle: {
    position: "absolute",
    right: 8,
    top: 8,
    height: 28,
    width: 28,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
  },
  error: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    fontSize: 14,
  },
  button: {
    marginTop: 14,
    width: "100%",
    height: 46,
    border: "none",
    borderRadius: 8,
    background:
      "linear-gradient(135deg, rgba(220,53,69,1) 0%, rgba(200,35,51,1) 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
};
