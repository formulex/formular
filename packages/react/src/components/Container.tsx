import React, { useImperativeHandle } from 'react';
import { FormInstance } from '@formular/core';
import { useForm, FormOptions } from '../hooks/useForm';
import { FormContext } from '../contexts';

export interface ContainerProps extends FormOptions<any> {
  form?: FormInstance;
  ref?: React.RefObject<FormInstance>;
}

export const Container: React.FC<ContainerProps> = React.forwardRef(
  ({ form, children, ...options }, ref) => {
    const formInstance = useForm(options, form);
    useImperativeHandle(ref, () => formInstance);
    return (
      <FormContext.Provider value={formInstance}>
        {children}
      </FormContext.Provider>
    );
  }
);
