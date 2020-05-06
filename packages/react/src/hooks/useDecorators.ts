import { useEffect } from 'react';
import type { FormFeature, FormInstance } from '@formular/core';

export function useDecorators(form: FormInstance, decorators?: FormFeature[]) {
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
