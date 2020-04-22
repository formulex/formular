import { useEffect, useRef } from 'react';
import type { FormInstance, FormConfig } from '@formular/core';

export function useFormConfig<V>(
  form: FormInstance,
  { initialValues }: FormConfig<V>
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      console.log('first', form);
      form.setFallbackInitialValues(initialValues);
      isFirstRender.current = false;
    }
  });

  useEffect(() => {
    if (form._fallbackInitialValues !== initialValues) {
      form.setFallbackInitialValues(initialValues);
    }
  }, [form, initialValues]);
}
