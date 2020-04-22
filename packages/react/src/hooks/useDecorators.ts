import { useEffect } from 'react';
import type { FormDecorator, FormInstance } from '@formular/core';

export function useDecorators(
  form: FormInstance,
  decorators?: FormDecorator[]
) {
  useEffect(() => {
    let unsubscribe: () => void | undefined;
    if (Array.isArray(decorators) && decorators.length) {
      unsubscribe = form.use(...decorators);
    }
    return () => {
      unsubscribe?.();
    };
  }, [form, decorators]);
}
