import { FormInstance } from '@formular/core/lib/src2/models/form';
import { useEffect } from 'react';
import type { FormDecorator } from '@formular/core/lib/src2/decorators/types';

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
