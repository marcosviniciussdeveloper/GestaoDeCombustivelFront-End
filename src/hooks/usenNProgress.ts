import { useIsFetching } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';


NProgress.configure({ showSpinner: false, speed: 300 });

export function useNProgress() {
  const isFetching = useIsFetching(); 

  useEffect(() => {
    if (isFetching) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);
}
