import {
  CreateFormOptions,
  FormInstance,
  createForm,
  FieldInstance,
  FieldArrayInstance,
  FieldGroupInstance,
  fieldResolver
} from '@formular/core';
import { useMemo, useEffect, useCallback } from 'react';
import { autorun } from 'mobx';
import { useAsObservableSource } from 'mobx-react';

export interface FormOptions<Values> extends CreateFormOptions<Values> {
  setup?: (resolvers: {
    field: (name: string) => FieldInstance;
    group: (name: string) => FieldGroupInstance;
    array: (name: string) => FieldArrayInstance;
  }) => void;
}

export function useForm<Values = any>(
  options: FormOptions<Values> = {},
  previousForm?: FormInstance
): FormInstance {
  const form = useMemo(() => {
    return previousForm || createForm(options);
  }, []);

  useEffect(() => {
    if (!previousForm) {
      form.root.patchValue(options.values || {});
    }
  }, [options.values, form, previousForm]);

  useEffect(() => {
    if (!previousForm) {
      form.root.patchInitialValue(options.initialValues || {});
    }
  }, [options.initialValues, form, previousForm]);

  const resolver = useMemo(() => {
    return ((base: FieldGroupInstance) => (name: string) =>
      fieldResolver(base, name))(form.root);
  }, [form]);

  const resolvers = useAsObservableSource({
    field: resolver as (name: string) => FieldInstance,
    group: resolver as (name: string) => FieldGroupInstance,
    array: resolver as (name: string) => FieldArrayInstance
  });

  useEffect(() => {
    return autorun(
      () => {
        if (typeof options.setup === 'function') {
          options.setup(resolvers);
        }
      },
      { name: `FormularAutorunWithTheseFieldNames:(${Object.keys(form.value).join('|')})` }
    );
  }, [resolver]);

  return form;
}
