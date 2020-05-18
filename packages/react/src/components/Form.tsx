import React, { useImperativeHandle } from 'react';
import {
  useForm,
  useSetup,
  useDecorators,
  useFormConfig,
  useRegistry
} from '../hooks';
import { renderComponent, RenderableProps } from '../utils';
import { FieldContext, RegistryContext } from '../contexts';
import type {
  FormInstance,
  FormFeature,
  SubscribeSetup,
  FormConfig,
  FormValidateCallOptions
} from '@formular/core';
import { RegistryEntry } from '../registry';

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
>;

export interface FormProps<V, XFP>
  extends BaseFormProps,
    Omit<RenderableProps<{ form: FormInstance }>, 'children'>,
    FormConfig<V>,
    FormValidateCallOptions,
    RegistryEntry<XFP> {
  form?: FormInstance;
  subscribe?: SubscribeSetup;
  decorators?: FormFeature[];
  children?:
    | RenderableProps<{ form: FormInstance }>['children']
    | React.ReactNode;
  formComponentProps?: XFP;
}

export const Form = React.forwardRef<FormInstance, FormProps<any, any>>(
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
      fields,
      formComponent,
      formComponentProps,
      ...restProps
    },
    ref
  ) => {
    const [formInstance] = useForm(form);
    useFormConfig(formInstance, { initialValues, trigger, debounce, onFinish });
    useImperativeHandle(ref, () => formInstance);
    useSetup(formInstance, subscribe);
    useDecorators(formInstance, decorators);
    const [registry] = useRegistry({
      fields,
      formComponent
    });

    return React.createElement(
      registry.formComponent,
      {
        ...restProps,
        ...formComponentProps,
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          event.stopPropagation();
          if (formInstance.validating) {
            return;
          }
          const errors = await formInstance.validate({ abortEarly });
          if (Array.isArray(errors)) {
            // noop
          } else {
            onFinish?.(formInstance.values);
          }
        }
      },
      <RegistryContext.Provider value={registry}>
        <FieldContext.Provider value={formInstance}>
          {typeof children === 'function'
            ? renderComponent(
                { children, component, render },
                { form: formInstance },
                'FormularForm'
              )
            : children}
        </FieldContext.Provider>
      </RegistryContext.Provider>
    );
  }
);

Form.displayName = 'FormularForm';
