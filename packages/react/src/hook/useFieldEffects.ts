import { useFormInstance } from './useFormInstance';
import { useEffect } from 'react';
import type {
  SubscribeSetup,
  SubscribeArgs,
  FormInstance
} from '@formular/core';

export function useFieldEffects(effects?: SubscribeSetup<SubscribeArgs>) {
  const formInstance = useFormInstance('useFieldEffects');
  useInnerFieldEffects(formInstance, effects);
}

export function useInnerFieldEffects(
  formInstance: FormInstance,
  effects?: SubscribeSetup<SubscribeArgs>
) {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (typeof effects === 'function') {
      unsubscribe = formInstance.subscribe(effects);
    }
    return () => {
      unsubscribe?.();
    };
  }, [effects]);
}
