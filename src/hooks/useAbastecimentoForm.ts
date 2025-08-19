

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api, type FormularioAbastecimento } from '../api';


export function useAbastecimentoForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormularioAbastecimento) => api.registrarAbastecimento(formData),
    onSuccess: () => {
      toast.success('Abastecimento registrado com sucesso!');

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
