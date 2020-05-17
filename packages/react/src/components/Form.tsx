import React, { useImperativeHandle } from 'react';
import { useForm, useSetup, useDecorators, useFormConfig } from '../hooks';
import { renderComponent, RenderableProps } from '../utils';
import { FieldContext } from '../contexts';
import type {
  FormInstance,
  FormFeature,
  SubscribeSetup,
  FormConfig,
  FormValidateCallOptions
} from '@formular/core';

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
>;

export interface FormProps<V>
  extends BaseFormProps,
    Omit<RenderableProps<{ form: FormInstance }>, 'children'>,
    FormConfig<V>,
    FormValidateCallOptions {
  form?: FormInstance;
  subscribe?: SubscribeSetup;
  decorators?: FormFeature[];
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
      trigger,
      debounce,
      abortEarly,
      ...restProps
    },
    ref
  ) => {
    const [formInstance] = useForm(form);
    useFormConfig(formInstance, { initialValues, trigger, debounce, onFinish });
    useImperativeHandle(ref, () => formInstance);
    useSetup(formInstance, subscribe);
    useDecorators(formInstance, decorators);

    return (
      <form
        {...restProps}
        onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          event.stopPropagation();
          console.log('start');
          if (formInstance.validating) {
            return;
          }
          const errors = await formInstance.validate({ abortEarly });
          console.log('end', errors);
          if (Array.isArray(errors)) {
            // noop
          } else {
            onFinish?.(formInstance.values);
          }
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
