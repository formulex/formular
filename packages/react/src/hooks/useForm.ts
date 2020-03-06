import { CreateFormOptions, FormInstance, createForm } from '@formular/core';
import { useMemo } from 'react';

export function useForm<Values = any>(
  options: CreateFormOptions<Values>,
  previousForm?: FormInstance
) {
  const form = useMemo(() => {
    return previousForm || createForm(options);
  }, []);

  return form;
}
