import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../providers/authProvider';
import type { ReadMotoristaDto, FormularioMotoristaCompleto } from '../api';
import '../styles/Motorista.css';

const KpiCard = ({ icon, title, value, color, isLoading }: any) => (
  <div className={`kpi-card ${color}`}>
    <div className="kpi-info">
      <span className="kpi-title">{title}</span>
      {isLoading ? <div className="loading-shimmer" style={{ height: '28px', width: '40px' }}></div> : <span className="kpi-value">{value}</span>}
    </div>
    <div className="kpi-icon"><i className={icon}></i></div>
  </div>
);

const MotoristaCard = ({ motorista, onEdit, onStatusChange }: {
  motorista: ReadMotoristaDto;
  onEdit: (motorista: ReadMotoristaDto) => void;
  onStatusChange: (motoristaId: string, novoStatus: boolean) => void;
}) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoStatus = e.target.value === 'true';
    onStatusChange(motorista.motoristaId!, novoStatus);
  };

  const statusAtual = motorista.status  ?? true;
  const statusClasse = statusAtual ? "ativo" : "status-inativo";

  return (
    <div className="motorista-card">
      <div className="motorista-card-header">
        <div className="motorista-avatar">
          {motorista.nome.charAt(0).toUpperCase()}
        </div>
        <div className="motorista-info">
          <h3 className="motorista-nome">{motorista.nome}</h3>
          <div className="motorista-actions">
            <select
              value={String(motorista.status)}
              onChange={handleStatusChange}
              className={`status-select ${statusClasse}`}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
            <button
              className="btn-edit"
              onClick={() => onEdit(motorista)}
              title="Editar motorista"
            >
              <i className="fa-solid fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="motorista-card-body">
        <div className="motorista-detail">
          <i className="fa-solid fa-envelope"></i>
          <span>{motorista.email}</span>
        </div>
        <div className="motorista-detail">
          <i className="fa-solid fa-id-card"></i>
          <span>CPF: {motorista.cpf}</span>
        </div>
        <div className="motorista-detail">
          <i className="fa-solid fa-id-badge"></i>
          <span>CNH: {motorista.categoriaCnh}</span>
        </div>
      </div>
      <div className="motorista-card-footer">
        <span className="data-vinculo">
          Desde: {motorista.dataVinculo ? new Date(motorista.dataVinculo).toLocaleDateString('pt-BR') : '-'}
        </span>
      </div>
    </div>
  );
};

const ListaMotoristasView = ({ onCadastrarClick, onEditarClick }: {
  onCadastrarClick: () => void;
  onEditarClick: (motorista: ReadMotoristaDto) => void;
}) => {
  const { user } = useAuth();
  const empresaId = user?.empresaId;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const queryClient = useQueryClient();

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['motoristas', empresaId, searchTerm, statusFilter],
    queryFn: () => {
      const params: { q?: string; status?: boolean } = {};
      if (searchTerm) {
        params.q = searchTerm;
      }
      if (statusFilter !== 'todos') {
        params.status = statusFilter === 'ativo';
      }
      return api.listarMotoristasPorEmpresa(String(empresaId!), params);
    },
    enabled: !!empresaId,
  });

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: ({ motoristaId, status }: { motoristaId: string; status: boolean }) =>
      api.atualizarStatusMotorista(motoristaId, status),
    onSuccess: () => {
      toast.success('Status do motorista atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['motoristas', empresaId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status do motorista');
    }
  });

  const handleStatusChange = (motoristaId: string, novoStatus: boolean) => {
    updateStatus({ motoristaId, status: novoStatus });
  };

  const kpis = useMemo(() => {
    if (!motoristas) return { ativos: 0, total: 0 };
    return {
      total: motoristas.length,
      ativos: motoristas.filter(m => m.status).length,
    };
  }, [motoristas]);

  return (
    <div className="page-container">
      <div className="kpi-section">
        <KpiCard
          icon="fa-solid fa-user-check"
          title="MOTORISTAS ATIVOS"
          value={kpis.ativos}
          color="green"
          isLoading={isLoading}
        />
        <KpiCard
          icon="fa-solid fa-users"
          title="TOTAL MOTORISTAS"
          value={kpis.total}
          color="blue"
          isLoading={isLoading}
        />
      </div>
      <div className="toolbar">
        <div className="search-container">
          <div className="search-input">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Buscar motoristas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <button className="btn btn-primary" onClick={onCadastrarClick}>
            <i className="fa-solid fa-plus"></i>
            Adicionar Motorista
          </button>
        </div>
      </div>
      <div className="motoristas-grid">
        {isLoading && (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="loading-card">
              <div className="loading-shimmer"></div>
            </div>
          ))
        )}
        {!isLoading && motoristas?.map(motorista => (
          <MotoristaCard
            key={motorista.motoristaId}
            motorista={motorista}
            onEdit={onEditarClick}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
      {!isLoading && !motoristas?.length && (
        <div className="empty-state">
          <i className="fa-solid fa-users"></i>
          <h3>Nenhum motorista encontrado</h3>
          <p>Comece adicionando seu primeiro motorista</p>
        </div>
      )}
    </div>
  );
};

const FormularioCadastroView = ({
  onCancel,
  onSuccess,
  motoristaParaEditar
}: {
  onCancel: () => void;
  onSuccess: () => void;
  motoristaParaEditar?: ReadMotoristaDto;
}) => {
  const [formData, setFormData] = useState<Partial<FormularioMotoristaCompleto>>(() => {
    if (motoristaParaEditar) {
      return {
        nome: motoristaParaEditar.nome,
        email: motoristaParaEditar.email,
        cpf: motoristaParaEditar.cpf,
        numeroCnh: motoristaParaEditar.numeroCnh,
        categoriaCnh: motoristaParaEditar.categoriaCnh,
        validadeCnh: motoristaParaEditar.validadeCnh,
        senha: '',
      };
    }
    return {};
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!motoristaParaEditar;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (newData: FormularioMotoristaCompleto) => {
      if (!user?.empresaId) throw new Error("Empresa do gestor não encontrada.");
      if (isEditing) {
        return api.atualizarMotorista(motoristaParaEditar!.motoristaId!, newData);
      } else {
        return api.cadastrarMotoristaCompleto(newData, String(user.empresaId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = isEditing ? 'atualizar' : 'cadastrar';
    toast.promise(
      mutateAsync(formData as FormularioMotoristaCompleto),
      {
        loading: `${isEditing ? 'Atualizando' : 'Cadastrando'} motorista...`,
        success: `Motorista ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`,
        error: (err: any) => err.message || `Falha ao ${action} motorista.`,
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    switch (name) {
      case 'cpf':
        maskedValue = value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        break;
      case 'numeroCnh':
        maskedValue = value.replace(/\D/g, '').slice(0, 11);
        break;
      case 'categoriaCnh':
        maskedValue = value.replace(/[^A-Z]/g, '').slice(0, 5);
        break;
      case 'nome':
        maskedValue = value.replace(/[0-9!@#$%^&*()_+=[\]{}|;':".,<>?`~]/g, '').slice(0, 100);
        break;
      case 'email':
        maskedValue = value.slice(0, 255);
        break;
      case 'senha':
        maskedValue = value.slice(0, 50);
        break;
    }
    setFormData({ ...formData, [name]: maskedValue });
  };

  const isValidCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF[10])) return false;
    return true;
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <div className="form-header">
          <h2>{isEditing ? 'Editar Motorista' : 'Cadastrar Novo Motorista'}</h2>
        </div>
        <form className="motorista-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Dados Pessoais</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Nome Completo *</label>
                <input name="nome" type="text" value={formData.nome || ''} onChange={handleChange} required disabled={isPending} maxLength={100} placeholder="Digite o nome completo do motorista" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={isPending} maxLength={255} placeholder="exemplo@email.com" />
              </div>
              <div className="form-group">
                <label>CPF *</label>
                <input name="cpf" type="text" value={formData.cpf || ''} onChange={handleChange} required disabled={isPending || isEditing} maxLength={14} placeholder="000.000.000-00" className={formData.cpf && !isValidCPF(formData.cpf) ? 'error' : ''} />
                {formData.cpf && !isValidCPF(formData.cpf) && formData.cpf.length >= 11 && (<span className="error-message">CPF inválido</span>)}
              </div>
              <div className="form-group full-width">
                <label>Senha de Acesso {isEditing ? '(deixe em branco para manter a atual)' : '*'}</label>
                <input name="senha" type="password" value={formData.senha || ''} onChange={handleChange} required={!isEditing} disabled={isPending} maxLength={50} minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Dados da CNH</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Número CNH *</label>
                <input name="numeroCnh" type="text" value={formData.numeroCnh || ''} onChange={handleChange} required disabled={isPending} maxLength={11} placeholder="Digite apenas números" />
              </div>
              <div className="form-group">
                <label>Validade CNH *</label>
                <input name="validadeCnh" type="date" value={formData.validadeCnh || ''} onChange={handleChange} required disabled={isPending} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Categoria CNH *</label>
                <input name="categoriaCnh" type="text" value={formData.categoriaCnh || ''} onChange={handleChange} required disabled={isPending} maxLength={5} placeholder="A, B, C, D, E" style={{ textTransform: 'uppercase' }} />
                <span className="help-text">Categorias válidas: A, B, C, D, E (pode combinar: AB, AC, etc.)</span>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isPending}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MotoristaPage() {
  const [view, setView] = useState<'LISTA' | 'CADASTRO' | 'EDICAO'>('LISTA');
  const [motoristaParaEditar, setMotoristaParaEditar] = useState<ReadMotoristaDto | undefined>();

  const handleEditarMotorista = (motorista: ReadMotoristaDto) => {
    setMotoristaParaEditar(motorista);
    setView('EDICAO');
  };

  const handleVoltarParaLista = () => {
    setMotoristaParaEditar(undefined);
    setView('LISTA');
  };

  if (view === 'CADASTRO') {
    return (<FormularioCadastroView onCancel={handleVoltarParaLista} onSuccess={handleVoltarParaLista} />);
  }

  if (view === 'EDICAO') {
    return (<FormularioCadastroView onCancel={handleVoltarParaLista} onSuccess={handleVoltarParaLista} motoristaParaEditar={motoristaParaEditar} />);
  }

  return (<ListaMotoristasView onCadastrarClick={() => setView('CADASTRO')} onEditarClick={handleEditarMotorista} />);
}
