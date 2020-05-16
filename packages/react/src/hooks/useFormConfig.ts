import { useEffect, useRef } from 'react';
import { FormInstance, FormConfig, isFieldInstance } from '@formular/core';
import { createValidationFeature } from '@formular/core/lib/features/validation';
import { addMiddleware } from 'mobx-state-tree';

export function useFormConfig<V>(
  form: FormInstance,
  { initialValues, trigger, debounce }: FormConfig<V>
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
    return form.use(createValidationFeature({ trigger, debounce }));
  }, [form, trigger, debounce]);
}
