import { useMemo } from 'react';
import {
  FieldGroupInstance,
  FieldArrayInstance,
  FieldInstance,
  getOrCreateNodeFromBase,
  AsyncRule,
  Rule
} from '@formular/core';
import { useScopeContext } from '../contexts/scope';

export interface CreateFieldOptions {
  name: string;
  initialValue?: any;
  rules?: Rule[];
  asyncRules?: AsyncRule[];
}

export interface FieldMeta {
  name: string;
  field: FieldInstance;
  group: FieldGroupInstance;
  array: FieldArrayInstance;
}

export function useField({
  name,
  initialValue,
  rules,
  asyncRules
}: CreateFieldOptions): [FieldMeta] {
  const scope = useScopeContext();

  const resultMeta = useMemo(() => {
    const firstRenderedFieldOrGroupOrArray:
      | FieldInstance
      | FieldGroupInstance
      | FieldArrayInstance = getOrCreateNodeFromBase(name, {
      initialValue,
      base: scope,
      rules,
      asyncRules
    });
    const meta = {
      name,
      field: firstRenderedFieldOrGroupOrArray as FieldInstance,
      group: firstRenderedFieldOrGroupOrArray as FieldGroupInstance,
      array: firstRenderedFieldOrGroupOrArray as FieldArrayInstance
    };

    return meta;
  }, [name, initialValue, scope, rules, asyncRules]);

  // [name, initialValue, scope, rules, asyncRules]

  return [resultMeta];
}
