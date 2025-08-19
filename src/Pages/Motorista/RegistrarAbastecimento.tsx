
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAbastecimentoForm } from '../../hooks/useAbastecimentoForm';
import { DadosAbastecimento } from '../../components/forms/AbastecimentoFormParts';
import { useAuth } from '../../providers/authProvider';
import { api } from '../../api'; // Importe a api
import '../../styles/Formulario.css';
import toast from 'react-hot-toast';

export default function RegistrarAbastecimentoMotorista() {
    const { user } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const { registrarAbastecimento, isSaving } = useAbastecimentoForm();

    //
    const { data: detalhesMotorista, isLoading: isLoadingDetalhes } = useQuery({
        
       queryKey: ['detalhesMotorista', user?.motoristaId],
queryFn: () => api.getMotoristaById(user!.motoristaId!),
enabled: !!user?.motoristaId,

    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação: Não submete se os detalhes do motorista ainda não foram carregados.
        if (!detalhesMotorista) {
            toast.error("Não foi possível obter os dados do motorista. Tente novamente.");
            return;
        }

        // Montamos o payload final, usando os dados que buscámos da API.
        const payload = {
            ...formData,
            motoristaId: detalhesMotorista.motoristaId, // <-- Dado correto
            veiculoId: detalhesMotorista.veiculoId,     // <-- Dado correto
            custo: (formData.litros || 0) * (formData.valorPorLitro || 0)
        };
        registrarAbastecimento(payload);
    };

    // Se estiver a carregar os dados essenciais, mostramos uma mensagem.
    if (isLoadingDetalhes) {
        return <div className="loading-container">Carregando dados do motorista...</div>;
    }

    return (
        <div className="form-page-container">
            <div className="form-card">
                <div className="form-card-header teal"><h2>Registrar Meu Abastecimento</h2></div>
                <form className="form-content" onSubmit={handleSubmit}>
                    <div className="form-grid-container">
                        <DadosAbastecimento
                            formData={formData}
                            onFormChange={(e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                            disabled={isSaving}
                        />
                        {/* Adicione aqui o campo de geolocalização e outros campos do motorista */}
                    </div>
                    <div className="form-actions-container">
                        <button type="submit" className="btn btn-primary" disabled={isSaving || isLoadingDetalhes}>
                            {isSaving ? 'Enviando...' : 'Registrar Abastecimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
