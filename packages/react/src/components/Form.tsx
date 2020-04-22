import React, { useImperativeHandle } from 'react';
import { useForm, useSetup, useDecorators, useFormConfig } from '../hooks';
import { renderComponent, RenderableProps } from '../utils';
import { FieldContext } from '../contexts';
import {
  FormInstance,
  FormDecorator,
  SubscribeSetup,
  FormConfig
} from '@formular/core';

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
>;

export interface FormProps<V>
  extends BaseFormProps,
    Omit<RenderableProps<{ form: FormInstance }>, 'children'>,
    FormConfig<V> {
  form?: FormInstance;
  subscribe?: SubscribeSetup;
  decorators?: FormDecorator[];
  children?:
    | RenderableProps<{ form: FormInstance }>['children']
    | React.ReactNode;
}

export const Form = React.forwardRef<FormInstance, FormProps<any>>(
  (
    {
      form,
      children,
      render,
      component,
      subscribe,
      decorators,
      initialValues,
      onFinish,
      ...restProps
    },
    ref
  ) => {
    const [formInstance] = useForm(form);
    useFormConfig(formInstance, { initialValues, onFinish });
    useImperativeHandle(ref, () => formInstance);
    useSetup(formInstance, subscribe);
    useDecorators(formInstance, decorators);

    return (
      <form
        {...restProps}
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          event.stopPropagation();
          // fixme: submit
          formInstance;
        }}
      >
        <FieldContext.Provider value={formInstance}>
          {typeof children === 'function'
            ? renderComponent(
                { children, component, render },
                { form: formInstance },
                'FormularForm'
              )
            : children}
        </FieldContext.Provider>
      </form>
    );
  }
);

Form.displayName = 'FormularForm';
