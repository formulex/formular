import { FormInstance, createForm } from '@formular/core';
import { useRef } from 'react';

export function useForm(form?: FormInstance): [FormInstance] {
  const formRef = useRef<FormInstance>();
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      formRef.current = createForm({});
    }
  }
  return [formRef.current];
}
