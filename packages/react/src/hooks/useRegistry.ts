import { Registry, RegistryEntry } from '../registry';
import { useRef, useEffect } from 'react';

export function useRegistry({
  fields: fieldComponents,
  formComponent,
  formItemComponent
}: RegistryEntry): [Registry] {
  const registryRef = useRef<Registry>();
  if (!registryRef.current) {
    registryRef.current = new Registry();

    // first render
    if (typeof fieldComponents === 'object' && fieldComponents !== null) {
      registryRef.current?.registerLocalFields(fieldComponents);
    }
    if (formComponent && typeof formComponent !== 'string') {
      registryRef.current?.registerLocalFormComponent(formComponent);
    }
    if (formItemComponent) {
      registryRef.current?.registerLocalItemComponent(formItemComponent);
    }
  }

  // useEffect(() => {
  //   if (typeof fieldComponents === 'object' && fieldComponents !== null) {
  //     registryRef.current?.registerLocalFields(fieldComponents);
  //   }

  //   return () => {
  //     if (typeof fieldComponents === 'object' && fieldComponents !== null) {
  //       registryRef.current?.unregisterLocalFields(
  //         ...Object.keys(fieldComponents)
  //       );
  //     }
  //   };
  // }, [registryRef.current, fieldComponents]);

  // useEffect(() => {
  //   console.log('inner', registryRef, formComponent);
  //   if (formComponent && typeof formComponent !== 'string') {
  //     registryRef.current?.registerLocalFormComponent(formComponent);
  //   }
  //   console.log('inner after', registryRef, formComponent);
  //   return () => {
  //     if (formComponent) {
  //       registryRef.current?.unregisterLocalFormComponent();
  //     }
  //   };
  // }, [registryRef.current, formComponent]);

  // useEffect(() => {
  //   if (formItemComponent) {
  //     registryRef.current?.registerLocalItemComponent(formItemComponent);
  //   }
  //   return () => {
  //     if (formItemComponent) {
  //       registryRef.current?.unregisterLocalItemComponent();
  //     }
  //   };
  // }, [registryRef.current, formItemComponent]);

  return [registryRef.current];
}
