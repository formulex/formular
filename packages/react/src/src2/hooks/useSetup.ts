import { FormInstance } from '@formular/core/lib/src2/models';
import { useEffect } from 'react';
import { SubscribeSetup } from '@formular/core/lib/src2/sideEffect';

export function useSetup(form: FormInstance, setup?: SubscribeSetup) {
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
