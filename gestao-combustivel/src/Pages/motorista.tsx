// src/Pages/Motorista.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "../providers/authProvider";


type Motorista = {
  motoristaId?: string | number;
  motoristaUsuarioId?: string | number;
  nome?: string;
  cpf?: string;
  numeroCnh?: string;
  validadeCnh?: string;
  statusVinculo?: string; // "ativo" | "inativo"
};

export default function MotoristaPage() {
  const auth = useAuth();
  const [items, setItems] = useState<Motorista[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"todos" | "ativo" | "inativo">("todos");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const empresaId =
          (auth.user as any)?.empresaId ??
          localStorage.getItem("empresaId") ??
          "";

        const data = await api.listarMotoristasPorEmpresa(empresaId, {
          page: 1,
          pageSize: 50,
          status,
          q,
        });

        const arr: Motorista[] = Array.isArray((data as any)?.items)
          ? (data as any).items
          : Array.isArray(data)
          ? (data as any)
          : [];

        setItems(arr);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, q, auth.user]);

  const filtrados = useMemo(() => {
    let base = items;
    if (q.trim()) {
      const t = q.toLowerCase();
      base = base.filter(
        (m) =>
          (m.nome ?? "").toLowerCase().includes(t) ||
          (m.cpf ?? "").includes(q)
      );
    }
    if (status !== "todos") {
      base = base.filter(
        (m) => (m.statusVinculo ?? "").toLowerCase() === status
      );
    }
    return base;
  }, [items, q, status]);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Motoristas</h1>
        <button className="btn btn-primary">+ Cadastrar Motorista</button>
      </header>

      <div className="grid grid-cols-[1fr_200px_120px_120px] gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome ou CPF"
          className="border rounded px-3 h-11"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="border rounded px-3 h-11"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button className="btn btn-primary h-11" onClick={() => { /* já filtra via state */ }}>
          Filtrar
        </button>
        <button
          className="btn h-11"
          onClick={() => {
            setQ("");
            setStatus("todos");
          }}
        >
          Limpar
        </button>
      </div>

      <div className="bg-white border rounded p-4">
        {loading ? (
          <div>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            <div className="text-rose-500 text-3xl mb-2">👥</div>
            Nenhum motorista encontrado.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtrados.map((m) => (
              <li
                key={String(m.motoristaId ?? m.motoristaUsuarioId ?? Math.random())}
                className="flex items-center justify-between border rounded px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{m.nome ?? "—"}</div>
                  <div className="text-sm text-slate-600">
                    CPF: {m.cpf ?? "—"} • CNH: {m.numeroCnh ?? "—"} • Validade:{" "}
                    {m.validadeCnh ?? "—"}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    (m.statusVinculo ?? "").toLowerCase() === "ativo"
                      ? "bg-green-100 text-green-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {(m.statusVinculo ?? "INDEFINIDO").toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
