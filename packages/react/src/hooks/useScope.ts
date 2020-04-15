import {
  fieldResolver,
  FieldGroupInstance,
  isFieldGroupInstance,
  getOrCreateNodeFromBase
} from '@formular/core';
import { useScopeContext } from '../contexts/scope';
import { useEffect } from 'react';

export interface ScopeOptions {
  name?: string;
  autoCreate?: boolean;
}

export function useScope({
  name,
  autoCreate = true
}: ScopeOptions): FieldGroupInstance {
  console.log('scope', name);
  useEffect(() => {
    console.log('scopeffect', name);
  }, [name]);
  const previousScope = useScopeContext();
  const node =
    autoCreate && name
      ? getOrCreateNodeFromBase(
          name,
          { base: previousScope, type: 'object' },
          true
        ).node
      : fieldResolver(previousScope, name);

  if (!isFieldGroupInstance(node)) {
    throw new Error(
      `Scope context value must be with type "FieldGroup", but got ${node} with type ${
        (node && (node as any).value) || typeof node
      }`
    );
  }
  return node;
}
