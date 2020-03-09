import { useFormContext } from '../contexts/form';
import { useEffect } from 'react';
import { useAsObservableSource } from 'mobx-react';
import {
  FieldGroupInstance,
  FieldArrayInstance,
  FieldInstance
} from '@formular/core';

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
  const formInstance = useFormContext();
  const fieldInstance = useAsObservableSource({
    name,
    field: (() => {
      let result = null as any;
      const disposer = formInstance.registerField(
        name,
        (node: FieldInstance | FieldGroupInstance | FieldArrayInstance) => {
          result = node;
          return () => {};
        },
        { initialValue }
      );
      disposer();
      return result;
    })()
  });
  useEffect(() => {
    return formInstance.registerField(
      name,
      (node: FieldInstance | FieldGroupInstance | FieldArrayInstance) => {
        fieldInstance.field = node;
        return () => {};
      },
      { initialValue }
    );
  }, [initialValue]);
  return fieldInstance;
}
