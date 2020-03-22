import React, { useImperativeHandle } from 'react';
import { FormInstance, FieldGroupInstance } from '@formular/core';
import { useForm, FormOptions } from '../hooks/useForm';
import { FormContext } from '../contexts';
import { ScopeConext } from '../contexts/scope';
import { AutorunEffect, ReactionTrace, ReactionEffect } from '../hooks';
import { Scope } from './Scope';

export interface ContainerProps extends FormOptions<any> {
  form?: FormInstance;
  ref?: React.RefObject<FormInstance>;
  autoRuns?: AutorunEffect | AutorunEffect[];
  reactions?:
    | [ReactionTrace, ReactionEffect]
    | [ReactionTrace, ReactionEffect][];
  children?:
    | React.ReactNode
    | ((FormInstance: FormInstance) => React.ReactNode);
}

export const Container: React.FC<ContainerProps> = React.forwardRef(
  ({ form, children, autoRuns, reactions, ...options }, ref) => {
    const [formInstance] = useForm(options, form);
    useImperativeHandle(ref, () => formInstance);
    return (
      <FormContext.Provider value={formInstance}>
        <ScopeConext.Provider value={formInstance.root as FieldGroupInstance}>
          <Scope autoRuns={autoRuns} reactions={reactions}>
            {typeof children === 'function'
              ? (children as any)(formInstance)
              : children}
          </Scope>
        </ScopeConext.Provider>
      </FormContext.Provider>
    );
  }
);
