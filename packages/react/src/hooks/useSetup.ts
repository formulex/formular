import type { FormInstance, SubscribeSetup } from '@formular/core';
import { useLayoutEffect } from 'react';

export function useSetup(form: FormInstance, setup?: SubscribeSetup) {
  useLayoutEffect(() => {
    let unsubscribe: () => void | undefined;
    if (typeof setup === 'function') {
      unsubscribe = form.subscribe(setup);
    }
    return () => {
      unsubscribe?.();
    };
  }, [form, setup]);
}
