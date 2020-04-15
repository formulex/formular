import { useMemo, useEffect } from 'react';
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
  console.log('field', name);
  useEffect(() => {
    console.log('fieldEffect', name);
  }, [name]);
  const { meta, replaceBase } = useMemo(() => {
    const {
      node: firstRenderedFieldOrGroupOrArray,
      replaceBase
    } = getOrCreateNodeFromBase(
      name,
      {
        initialValue,
        base: scope,
        rules,
        asyncRules
      },
      true
    );
    const meta = {
      name,
      field: firstRenderedFieldOrGroupOrArray as FieldInstance,
      group: firstRenderedFieldOrGroupOrArray as FieldGroupInstance,
      array: firstRenderedFieldOrGroupOrArray as FieldArrayInstance
    };

    return { meta, replaceBase };
  }, [name, initialValue, scope, rules, asyncRules]);

  // useEffect(() => {
  //   if (replaceBase) {
  //     // destroy(replaceBase);
  //     scope.replace(replaceBase as any);
  //   }
  // }, [replaceBase, scope]);

  // [name, initialValue, scope, rules, asyncRules]

  return [meta];
}
