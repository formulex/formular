import { useEffect, useRef } from 'react';
import { FormInstance, FormConfig } from '@formular/core';
import { createValidationFeature } from '@formular/core/lib/features/validation';
import { FormMetaProps } from '../hoc';

export function useFormConfig<V>(
  form: FormInstance,
  {
    initialValues,
    triggers,
    debounce,
    plain
  }: FormConfig<V> & Pick<FormMetaProps<any, V>, 'plain'>
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      form.setFallbackInitialValues(initialValues);
      isFirstRender.current = false;
    }
  });

  useEffect(() => {
    if (form._fallbackInitialValues !== initialValues) {
      form.setFallbackInitialValues(initialValues);
    }
  }, [form, initialValues]);

  useEffect(() => {
    if (typeof plain === 'boolean') {
      form.plain = plain;
    }
  }, [form, plain]);

  useEffect(() => {
    return form.use(createValidationFeature({ triggers, debounce }));
  }, [form, triggers, debounce]);
}
