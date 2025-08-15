// src/api/index.ts
import { http } from "./Client";


export type User = {
  nome: string;
  tipoUsuario: string;
  empresaId: number | string | null;
};

export type AuthOk = {
  data: any;
  usuario: any;
  accessToken: string;
  token: string;
  user: User;
};

export type DashboardData = {
  empresasAtivas: number;
  totalMotoristas: number;
  totalVeiculos: number;
  totalAbastecimentos: number;
};


type AuthResponse = {
  accessToken?: string;
  token?: string;
  usuario?: {
    nome?: string;
    tipoUsuario?: string;
    empresaId?: number | string | null;
  };
};

export const api = {
 
  async signIn(email: string, senha: string): Promise<AuthOk> {
    const { data } = await http.post<AuthResponse>("/api/Usuario/autenticar", { email, senha });

    const token = data.accessToken || data.token || "";
    const user: User = {
      nome: data.usuario?.nome ?? "Usuário",
      tipoUsuario: data.usuario?.tipoUsuario ?? "usuario",
      empresaId: data.usuario?.empresaId ?? null,
    };

    return {
      data,
      usuario: data.usuario,
      accessToken: data.accessToken || "",
      token,
      user
    };
  },

  async dashboard(params?: { de?: string; ate?: string; empresaId?: string | number }): Promise<DashboardData> {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresaId", String(params.empresaId));
    if (params?.de) qs.set("de", params.de);
    if (params?.ate) qs.set("ate", params.ate);

    const url = `/Dashboard${qs.toString() ? `?${qs.toString()}` : ""}`;
    const { data } = await http.get<DashboardData>(url);
    return data;
  },


   
  async listarMotoristasPorEmpresa(
    empresaId: string | number,
    opts?: { page?: number; pageSize?: number; status?: string; q?: string }
  ): Promise<any[]> {
    const qs = new URLSearchParams();
    if (opts?.page) qs.set("page", String(opts.page));
    if (opts?.pageSize) qs.set("pageSize", String(opts.pageSize));
    if (opts?.status && opts.status !== "todos") qs.set("status", opts.status);
    if (opts?.q) qs.set("q", opts.q);

    const url = `/api/empresa-motoristas/${empresaId}/lista${qs.toString() ? `?${qs.toString()}` : ""}`;
    const { data } = await http.get<any>(url);

 
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },
};
export function dashboard() {
    throw new Error("Function not implemented.");
}

