import { useIsFetching } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';

// Configuração para deixar a animação mais suave
NProgress.configure({ showSpinner: false, speed: 300 });

export function useNProgress() {
  const isFetching = useIsFetching(); // Hook do react-query que retorna > 0 se alguma query estiver a ser executada

  useEffect(() => {
    if (isFetching) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);
}
