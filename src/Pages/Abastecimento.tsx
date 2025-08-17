// Em: src/Pages/Abastecimento.tsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../providers/authProvider';
import '../styles/formulario.css';
import { api, type FormularioAbastecimento, type Veiculo } from '../api';

export default function AbastecimentoPage() {
    // O estado inicial agora reflete melhor os campos da API
    const [formData, setFormData] = useState<Partial<FormularioAbastecimento>>({
        data: new Date().toISOString(),
        tipoCombustivel: 'Gasolina',
        notaFiscalUrl: '',
        localizacao: '',
    });

    // Estado separado e temporário apenas para o cálculo do custo no frontend.
    const [valorPorLitro, setValorPorLitro] = useState<number>(0);

    const { user } = useAuth();
    const queryClient = useQueryClient();

    // --- BUSCA DE DADOS PARA OS SELETORES (sem alterações) ---
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

    // --- LÓGICA DA MUTATION (CORRIGIDA) ---
    const { mutate, isPending } = useMutation({
        mutationFn: (newData: Partial<FormularioAbastecimento>) => {
            // 1. CORREÇÃO: Usamos o estado 'valorPorLitro' para o cálculo, não 'newData'.
            const custoTotal = (newData.litros || 0) * valorPorLitro;

            // 2. Validação para garantir que o custo não é zero antes de enviar.
            if (custoTotal <= 0) {
                throw new Error("O custo total do abastecimento não pode ser zero.");
            }

            // 3. Montamos o payload final que corresponde EXATAMENTE ao JSON da API
            const payload: FormularioAbastecimento = {
                veiculoId: newData.veiculoId!,
                motoristaId: newData.motoristaId!,
                data: new Date(newData.data!).toISOString(),
                tipoCombustivel: newData.tipoCombustivel!,
                custo: custoTotal, // Enviamos o custo calculado corretamente
                notaFiscalUrl: newData.notaFiscalUrl || '',
                localizacao: newData.localizacao || '',
                kmInicial: newData.kmInicial || 0,
                litros: newData.litros || 0,
            };

            // 4. Chamamos a API com o payload correto
            return api.registrarAbastecimento(payload);
        },
        onSuccess: () => {
            toast.success('Abastecimento registrado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
            // Limpa o formulário e o valor por litro para um novo registro
            setFormData({
                data: new Date().toISOString(),
                tipoCombustivel: 'Gasolina',
                notaFiscalUrl: '',
                localizacao: '',
            });
            setValorPorLitro(0);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Falha ao registrar abastecimento.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData({ ...formData, [name]: isNumber ? parseFloat(value) || 0 : value });
    };

    // O cálculo do total para exibição na tela (sem alterações, já estava correto)
    const total = useMemo(() => {
        const litros = formData.litros || 0;
        return litros * valorPorLitro;
    }, [formData.litros, valorPorLitro]);

    const isLoading = isLoadingMotoristas || isLoadingVeiculos;

    return (
        <div className="form-page-container">
            <div className="form-card">
                <div className="form-card-header teal">
                    <h2>Registrar Novo Abastecimento</h2>
                </div>
                <form className="form-content" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="form-section-title">Informações Principais</h3>
                        <div className="form-grid-container">
                            {/* Seletores de Motorista e Veículo */}
                            <div className="form-group">
                                <label htmlFor="motoristaId">Motorista *</label>
                                <select id="motoristaId" name="motoristaId" onChange={handleChange} required disabled={isLoading || isPending} value={formData.motoristaId || ''}>
                                    <option value="" disabled>{isLoading ? 'Carregando...' : 'Selecione um motorista'}</option>
                                    {motoristas?.map(m => <option key={m.motoristaId} value={m.motoristaId}>{m.nome}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="veiculoId">Veículo *</label>
                                <select id="veiculoId" name="veiculoId" onChange={handleChange} required disabled={isLoading || isPending} value={formData.veiculoId || ''}>
                                    <option value="" disabled>{isLoading ? 'Carregando...' : 'Selecione um veículo'}</option>
                                    {veiculos?.map((v: Veiculo) => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
                                </select>
                            </div>

                            {/* Data e Tipo de Combustível */}
                            <div className="form-group">
                                <label htmlFor="data">Data e Hora *</label>
                                <input id="data" name="data" type="datetime-local" value={formData.data ? formData.data.substring(0, 16) : ''} onChange={handleChange} required disabled={isPending} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tipoCombustivel">Tipo de Combustível *</label>
                                <select id="tipoCombustivel" name="tipoCombustivel" onChange={handleChange} required disabled={isPending} value={formData.tipoCombustivel}>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Etanol">Etanol</option>
                                    <option value="Diesel">Diesel</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">Valores e Medições</h3>
                        <div className="form-grid-container">
                            {/* Litros e Valor por Litro */}
                            <div className="form-group">
                                <label htmlFor="litros">Litros *</label>
                                <input id="litros" name="litros" type="number" step="0.01" placeholder="Ex: 45.50" onChange={handleChange} required disabled={isPending} value={formData.litros || ''} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="valorPorLitro">Valor por Litro *</label>
                                {/* CORREÇÃO: O onChange e o value deste input devem usar o estado 'valorPorLitro' */}
                                <input id="valorPorLitro" name="valorPorLitro" type="number" step="0.01" placeholder="Ex: 5.99" onChange={(e) => setValorPorLitro(parseFloat(e.target.value) || 0)} required disabled={isPending} value={valorPorLitro || ''} />
                            </div>

                            {/* KM Inicial */}
                            <div className="form-group">
                                <label htmlFor="kmInicial">Quilometragem (KM) *</label>
                                <input id="kmInicial" name="kmInicial" type="number" placeholder="Ex: 123456" onChange={handleChange} required disabled={isPending} value={formData.kmInicial || ''} />
                            </div>

                            {/* Total Calculado */}
                            <div className="total-display-container">
                                <strong>Valor Total (Custo):</strong>
                                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">Informações Adicionais (Opcional)</h3>
                        <div className="form-grid-container">
                            {/* Localização e Nota Fiscal */}
                            <div className="form-group">
                                <label htmlFor="localizacao">Localização (Posto)</label>
                                <input id="localizacao" name="localizacao" type="text" placeholder="Ex: Posto Ipiranga, Av. Brasil" onChange={handleChange} disabled={isPending} value={formData.localizacao || ''} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="notaFiscalUrl">URL da Nota Fiscal</label>
                                <input id="notaFiscalUrl" name="notaFiscalUrl" type="text" placeholder="https://link.para/nota.pdf" onChange={handleChange} disabled={isPending} value={formData.notaFiscalUrl || ''} />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-container">
                        <button type="submit" className="btn btn-primary" disabled={isPending || isLoading} style={{ background: '#14b8a6', minWidth: '200px' }}>
                            {isPending ? 'Registrando...' : 'Registrar Abastecimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

