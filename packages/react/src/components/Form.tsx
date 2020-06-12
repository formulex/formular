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

export interface FormFeatures {
  plain?: boolean;
}

export interface FormProps<V, XFP>
  extends BaseFormProps,
    Omit<RenderableProps<{ form: FormInstance }>, 'children'>,
    FormConfig<V>,
    FormValidateCallOptions,
    RegistryEntry<XFP>,
    FormFeatures {
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
      onFinishFailed,
      triggers,
      debounce,
      abortEarly,
      fields,
      formComponent,
      formComponentProps,
      plain,
      ...restProps
    },
    ref
  ) => {
    const [formInstance] = useForm(form);
    useFormConfig(formInstance, {
      initialValues,
      triggers,
      debounce,
      plain
    });
    useImperativeHandle(ref, () => formInstance);

    useDecorators(formInstance, decorators);
    const [registry] = useRegistry({
      fields,
      formComponent
    });

    useSetup(formInstance, subscribe);

    const onSubmit: ((
      event: React.FormEvent<HTMLFormElement>
    ) => Promise<void>) & { __source: 'formular' } = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (formInstance.validating) {
        return;
      }
      const errors = await formInstance.validateFields({ abortEarly });
      if (Array.isArray(errors)) {
        onFinishFailed?.(errors);
      } else {
        onFinish?.(formInstance.values);
      }
    };
    onSubmit.__source = 'formular';

    const passProps = {
      ...restProps,
      ...formComponentProps,
      onSubmit,
      onReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        event.stopPropagation();
        formInstance.reset();
      },
      __onInnerSubmit: onSubmit
    };
    if (typeof registry.formComponent === 'string') {
      delete passProps.__onInnerSubmit;
    }

    return React.createElement(
      registry.formComponent,
      passProps,
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
