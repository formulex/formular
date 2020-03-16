import { CreateFormOptions, FormInstance, createForm } from '@formular/core';
import { useMemo, useEffect } from 'react';

export interface FormOptions<Values> extends CreateFormOptions<Values> {}

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

  return form;
}
