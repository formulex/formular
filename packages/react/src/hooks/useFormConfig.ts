import { useEffect, useRef } from 'react';
import { FormInstance, FormConfig } from '@formular/core';
import { createValidationFeature } from '@formular/core/lib/features/validation';
import { FormFeatures } from '../components/Form';

export function useFormConfig<V>(
  form: FormInstance,
  { initialValues, triggers, debounce, plain }: FormConfig<V> & FormFeatures
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
    console.log('triggers change to', triggers, debounce);
    return form.use(createValidationFeature({ triggers, debounce }));
  }, [form, triggers, debounce]);
}
