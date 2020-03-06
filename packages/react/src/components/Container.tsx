import React, { useImperativeHandle } from 'react';
import { CreateFormOptions, FormInstance } from '@formular/core';
import { useForm } from '../hooks/useForm';
import { FormContext } from '../contexts';

export interface ContainerProps extends CreateFormOptions<any> {
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
