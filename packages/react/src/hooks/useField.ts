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
  field: FieldInstance | FieldGroupInstance | FieldArrayInstance;
}

export function useField({
  name,
  initialValue
}: CreateFieldOptions): FieldMeta {
  const scope = useScopeContext();
  const fieldInstance = useAsObservableSource({
    name,
    field: getOrCreateNodeFromBase(name, { initialValue, base: scope })
  });
  useEffect(() => {
    fieldInstance.field = getOrCreateNodeFromBase(name, {
      initialValue,
      base: scope
    });
  }, [initialValue, scope]);
  return fieldInstance;
}
