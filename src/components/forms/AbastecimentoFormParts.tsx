// Crie o ficheiro: src/components/forms/AbastecimentoFormParts.tsx

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../providers/authProvider';
import { api, type ReadMotoristaDto, type Veiculo } from '../../api';

// --- Bloco para selecionar Motorista e Veículo (SÓ PARA O GESTOR) ---
export function SeletorGestor({ onMotoristaChange, onVeiculoChange, disabled }: any) {
  const { user } = useAuth();
  const { data: motoristas, isLoading: isLoadingMotoristas } = useQuery({
    queryKey: ['motoristas', user?.empresaId],
    queryFn: () => api.listarMotoristasPorEmpresa(String(user?.empresaId!)),
    enabled: !!user?.empresaId,
  });

  const { data: veiculos, isLoading: isLoadingVeiculos } = useQuery({
    queryKey: ['veiculos', user?.empresaId],
    queryFn: () => api.listarVeiculos(String(user?.empresaId!)),
    enabled: !!user?.empresaId,
  });

  return (
    <>
      <div className="form-group">
        <label>Motorista *</label>
        <select name="motoristaId" onChange={onMotoristaChange} required disabled={isLoadingMotoristas || disabled}>
          <option value="">Selecione um motorista</option>
          {motoristas?.map((m: ReadMotoristaDto) => <option key={m.motoristaId} value={m.motoristaId}>{m.nome}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Veículo *</label>
        <select name="veiculoId" onChange={onVeiculoChange} required disabled={isLoadingVeiculos || disabled}>
          <option value="">Selecione um veículo</option>
          {veiculos?.map((v: Veiculo) => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
        </select>
      </div>
    </>
  );
}

// --- Bloco com os campos de dados do abastecimento (COMUM PARA AMBOS) ---
export function DadosAbastecimento({ formData, onFormChange, disabled }: any) {
  return (
    <>
      <div className="form-group">
        <label>Data e Hora *</label>
        <input name="data" type="datetime-local" value={formData.data ? formData.data.substring(0, 16) : ''} onChange={onFormChange} required disabled={disabled} />
      </div>
      <div className="form-group">
        <label>Litros *</label>
        <input name="litros" type="number" step="0.01" placeholder="Ex: 45.50" value={formData.litros || ''} onChange={onFormChange} required disabled={disabled} />
      </div>
      {/* Adicione outros campos comuns aqui: valor por litro, km, etc. */}
    </>
  );
}
