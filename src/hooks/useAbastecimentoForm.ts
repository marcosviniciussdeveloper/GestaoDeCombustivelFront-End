// Crie o ficheiro: src/hooks/useAbastecimentoForm.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api, type FormularioAbastecimento } from '../api';

// Este hook contém toda a lógica de salvar e o feedback para o utilizador.
export function useAbastecimentoForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormularioAbastecimento) => api.registrarAbastecimento(formData),
    onSuccess: () => {
      toast.success('Abastecimento registrado com sucesso!');
      // Invalida tanto o dashboard quanto o histórico de abastecimentos.
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Falha ao registrar abastecimento.');
    },
  });

  return {
    registrarAbastecimento: mutate,
    isSaving: isPending,
  };
}
