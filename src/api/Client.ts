// src/api/Client.ts
const BASE = import.meta.env.VITE_API_BASE ?? "https://localhost:7105";

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("gc_auth_v1");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token: string | undefined = parsed?.accessToken || parsed?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  // A chamada fetch é a mesma
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers || {}),
    },
    body: init.body,
  });

  // --- LÓGICA DE RESPOSTA CORRIGIDA ---

  // Se a resposta não for OK (status fora de 200-299), trate o erro primeiro.
  if (!res.ok) {
    // Tenta ler o corpo do erro, se houver.
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || errorData?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // Se a resposta for OK, mas o status for 204 (No Content),
  // retorne um objeto de sucesso com dados nulos.
  // Isto agora só vai acontecer para chamadas DELETE ou PUT/POST que realmente não retornam nada.
  if (res.status === 204) {
    return { data: null as T };
  }

  // Se a resposta for OK e tiver conteúdo (200, 201), retorne os dados.
  const data = await res.json();
  return { data: data as T };
}
      
// O resto do seu objeto 'http' permanece exatamente o mesmo.
export const http = {
  get<T = unknown>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: "GET" });
  },
  post<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, {
      ...init,
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
  put<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, {
      ...init,
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
  del<T = unknown>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: "DELETE" });
  },

  // --- ADICIONE ESTE BLOCO ---
  patch<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, {
      ...init,
      method: "PATCH", // A única diferença é o método HTTP
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
};