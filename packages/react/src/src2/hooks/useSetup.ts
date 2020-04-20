import { FormInstance } from '@formular/core/lib/src2/models';
import { useEffect } from 'react';
import { Setup } from '@formular/core/lib/src2/sideEffect';

export function useSetup(form: FormInstance, setup?: Setup) {
  useEffect(() => {
    let unsubscribe: () => void | undefined;
    if (typeof setup === 'function') {
      unsubscribe = form.subscribe(setup);
    }
    return () => {
      unsubscribe?.();
    };
  }, [form, setup]);
}
