import { useFormInstance } from './useFormInstance';
import { useEffect } from 'react';
import type {
  SubscribeSetup,
  SubscribeArgs,
  FormInstance
} from '@formular/core';

export function useContextFieldEffects(
  effects?: SubscribeSetup<SubscribeArgs>
) {
  const formInstance = useFormInstance('useContextFieldEffects');
  useFieldEffects(formInstance, effects);
}

export function useFieldEffects(
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
