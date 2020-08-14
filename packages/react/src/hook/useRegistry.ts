import { Registry, RegistryEntry } from '../registry';
import { useRef } from 'react';

export function useRegistry({
  fields: fieldComponents
}: RegistryEntry): [Registry] {
  const registryRef = useRef<Registry>();
  if (!registryRef.current) {
    registryRef.current = new Registry();

    // first render
    if (typeof fieldComponents === 'object' && fieldComponents !== null) {
      registryRef.current?.registerLocalFields(fieldComponents);
    }
  }

  return [registryRef.current];
}
