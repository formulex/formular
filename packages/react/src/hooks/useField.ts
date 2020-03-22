import { useEffect } from 'react';
import { useAsObservableSource } from 'mobx-react';
import {
  FieldGroupInstance,
  FieldArrayInstance,
  FieldInstance,
  getOrCreateNodeFromBase
} from '@formular/core';
import { useScopeContext } from '../contexts/scope';

export interface CreateFieldOptions {
  name: string;
  initialValue?: any;
}

export interface FieldMeta {
  name: string;
  field: FieldInstance;
  group: FieldGroupInstance;
  array: FieldArrayInstance;
}

export function useField({
  name,
  initialValue
}: CreateFieldOptions): [FieldMeta] {
  const scope = useScopeContext();
  const firstRenderedFieldOrGroupOrArray:
    | FieldInstance
    | FieldGroupInstance
    | FieldArrayInstance = getOrCreateNodeFromBase(name, {
    initialValue,
    base: scope
  });
  const meta = useAsObservableSource({
    name,
    field: firstRenderedFieldOrGroupOrArray as FieldInstance,
    group: firstRenderedFieldOrGroupOrArray as FieldGroupInstance,
    array: firstRenderedFieldOrGroupOrArray as FieldArrayInstance
  });
  useEffect(() => {
    const fieldOrGroupOrArray:
      | FieldInstance
      | FieldGroupInstance
      | FieldArrayInstance = getOrCreateNodeFromBase(name, {
      initialValue,
      base: scope
    });
    meta.field = fieldOrGroupOrArray as FieldInstance;
    meta.group = fieldOrGroupOrArray as FieldGroupInstance;
    meta.array = fieldOrGroupOrArray as FieldArrayInstance;
  }, [initialValue, scope]);
  return [meta];
}
