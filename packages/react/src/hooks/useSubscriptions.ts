import type { SubscribeSetup } from '@formular/core';
import { useFieldContext } from '../contexts';
import { useSetup } from './useSetup';

export function useSubscriptions(subsribeFn: SubscribeSetup) {
  const formInstance = useFieldContext();
  useSetup(formInstance, subsribeFn);
}

// alias
export const useSideEffects = useSubscriptions;
