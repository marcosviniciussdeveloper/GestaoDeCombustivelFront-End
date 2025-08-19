// src/api/index.ts
import { http } from "./Client";

// --- TIPOS DE AUTENTICAÇÃO E USUÁRIO ---
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

type AuthResponse = {
  accessToken?: string;
  token?: string;
  usuario?: {
    nome?: string;
    tipoUsuario?: string;
    empresaId?: number | string | null;
  };
};

// --- TIPOS DO DASHBOARD ---
export type DashboardData = {
  economiaMensal: number;
  abastecimentosMensal: number;
  veiculosAtivos: number;
  motoristasAtivos: number;
};

export type DashboardMensalData = {
  mes: string;
  totalCusto: number;
  economia: number;
};

// --- TIPOS DE MOTORISTA ---
export type FormularioMotoristaCompleto = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  numeroCnh: string;
  validadeCnh: string;
  categoriaCnh: string;
};

export interface ReadMotoristaDto {
  veiculoId: any;
  motoristaId: string;
  nome: string;
  email: string;
  cpf: string;
  numeroCnh: string;
  validadeCnh: string;
  categoriaCnh: string;
  status: boolean;
  dataVinculo: string;
}

// --- TIPOS DE ABASTECIMENTO E VEÍCULO (CORRIGIDOS ) ---

// 1. ADICIONADO O TIPO 'Veiculo' QUE ESTAVA EM FALTA
// (Supondo que a sua API retorne estes campos. Ajuste se necessário.)
export type Veiculo = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
};

// O seu tipo de formulário de abastecimento já estava correto.
export type FormularioAbastecimento = {
  veiculoId: string;
  motoristaId: string;
  data: string; // "2025-08-17T20:53:22.000Z"
  tipoCombustivel: string;
  custo: number;
  notaFiscalUrl: string;
  localizacao: string;
  kmInicial: number;
  litros: number;
};


// --- OBJETO API (COM TODAS AS FUNÇÕES NECESSÁRIAS ) ---

export const api = {
  
  async signIn(email: string, senha: string): Promise<AuthOk> {
    const { data } = await http.post<AuthResponse>("/api/Usuario/autenticar", { email, senha } );
    const token = data.accessToken || data.token || "";
    const user: User = {
      nome: data.usuario?.nome ?? "Usuário",
      tipoUsuario: data.usuario?.tipoUsuario ?? "usuario",
      empresaId: data.usuario?.empresaId ?? null,
    };
    return { data, usuario: data.usuario, accessToken: data.accessToken || "", token, user };
  },

  // --- Funções do Dashboard ---
  async getDashboardData(empresaId: string, params?: { de?: string; ate?: string }): Promise<DashboardData> {
    const qs = new URLSearchParams({ empresaId });
    if (params?.de) qs.set("de", params.de);
    if (params?.ate) qs.set("ate", params.ate);
    const { data } = await http.get<DashboardData>(`/api/Dashboard?${qs.toString( )}`);
    return data;
  },

  async getDashboardMensal(empresaId: string, params?: { de?: string; ate?: string }): Promise<DashboardMensalData[]> {
    const qs = new URLSearchParams({ empresaId });
    if (params?.de) qs.set("de", params.de);
    if (params?.ate) qs.set("ate", params.ate);
    const { data } = await http.get<DashboardMensalData[]>(`/api/Dashboard/mensal?${qs.toString( )}`);
    return data ?? [];
  },

  // --- Funções de Motorista ---
  async cadastrarMotoristaCompleto(formData: FormularioMotoristaCompleto, empresaId: string): Promise<void> {
    const usuarioCriado = await http.post<{ id: string }>('/api/Usuario/registrar', {
      empresaId: empresaId,
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
      senha: formData.senha,
      tipoUsuario: 'MOTORISTA',
    } );

    await http.post(`/api/motorista/registrar?usuarioId=${usuarioCriado.data.id}`, {
      numeroCnh: formData.numeroCnh,
      validadeCnh: formData.validadeCnh,
      categoriaCnh: formData.categoriaCnh,
      status : true , 
    } );
  },

async listarMotoristasPorEmpresa(
  empresaId: string,
  params?: { q?: string; status?: boolean }
): Promise<ReadMotoristaDto[]> {
  const qs = new URLSearchParams();

  if (params?.q) qs.set("q", params.q);

  if (typeof params?.status === 'boolean') {
    qs.set("status", String(params.status)); // envia "true" ou "false"
  }

  const url = `/api/empresa-motoristas/${empresaId}/lista?${qs.toString()}`;
  const { data } = await http.get<ReadMotoristaDto[]>(url);
  return Array.isArray(data) ? data : [];
},


  async getMotoristaById(motoristaId: string): Promise<ReadMotoristaDto> {
    const { data } = await http.get<ReadMotoristaDto>(`/api/motorista/${motoristaId}` );
    return data;
  },

  async atualizarMotorista(motoristaId: string, formData: Partial<FormularioMotoristaCompleto>): Promise<void> {
    await http.put(`/api/motorista/${motoristaId}`, formData );
  },

  async atualizarStatusMotorista(motoristaId: string, novoStatus: boolean): Promise<void> {
    await http.patch(`/api/motorista/${motoristaId}/status`, { status: novoStatus } );
  },

  
   
  async listarVeiculos(empresaId: string): Promise<Veiculo[]> {
    const { data } = await http.get<Veiculo[]>(`/api/veiculos/empresa/${empresaId}` );
    return Array.isArray(data) ? data : [];
  },

 
  async registrarAbastecimento(formData: FormularioAbastecimento): Promise<void> {
    await http.post('/api/Abastecimento', formData );
  },
};
