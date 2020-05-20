import { useEffect, useRef } from 'react';
import { FormInstance, FormConfig } from '@formular/core';
import { createValidationFeature } from '@formular/core/lib/features/validation';
import { FormFeatures } from '../components/Form';

export function useFormConfig<V>(
  form: FormInstance,
  { initialValues, trigger, debounce, editable }: FormConfig<V> & FormFeatures
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
    if (typeof editable === 'boolean') {
      form.editable = editable;
    }
  }, [form, editable]);

  useEffect(() => {
    return form.use(createValidationFeature({ trigger, debounce }));
  }, [form, trigger, debounce]);
}
