import React, { useImperativeHandle } from 'react';
import { FormInstance } from '@formular/core';
import { useForm, FormOptions } from '../hooks/useForm';
import { FormContext } from '../contexts';
import { ScopeConext } from '../contexts/scope';
import { AutorunEffect, useAutoruns } from '../hooks';
import { Scope } from './Scope';

export interface ContainerProps extends FormOptions<any> {
  form?: FormInstance;
  ref?: React.RefObject<FormInstance>;
  autoRuns?: AutorunEffect | AutorunEffect[];
}

export const Container: React.FC<ContainerProps> = React.forwardRef(
  ({ form, children, autoRuns, ...options }, ref) => {
    const formInstance = useForm(options, form);
    useImperativeHandle(ref, () => formInstance);
    return (
      <FormContext.Provider value={formInstance}>
        <ScopeConext.Provider value={formInstance.root}>
          <Scope autoRuns={autoRuns}>{children}</Scope>
        </ScopeConext.Provider>
      </FormContext.Provider>
    );
  }
);
