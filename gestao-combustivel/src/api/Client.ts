// src/api/Client.ts
const BASE = import.meta.env.VITE_API_BASE ?? "https://localhost:7105";

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("auth") || localStorage.getItem("session");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token: string | undefined = parsed?.accessToken || parsed?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers || {}),
    },
    body: init.body,
  });

  if (res.status === 204) return { data: null as unknown as T };

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || data?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return { data: data as T };
}

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
};
