import React, { useImperativeHandle } from 'react';
import type {
  FormInstance,
  FormFeature,
  SubscribeSetup,
  FormConfig,
  FormValidateCallOptions
} from '@formular/core';
import {
  useForm,
  useDecorators,
  useSetup,
  useFormConfig,
  useRegistry
} from '../hooks';
import type { RegistryEntry } from '../registry';
import { RegistryContext, FieldContext } from '../contexts';

export interface InjectProps {
  onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void>;
  onReset(event: React.FormEvent<HTMLFormElement>): void;
}

export interface ContainerTransformOptions<P> {
  getDerivedProps?: (componentProps: P, injectProps: InjectProps) => P;
}

export interface FormMetaProps<P, V>
  extends FormConfig<V>,
    Pick<RegistryEntry, 'fields'>,
    FormValidateCallOptions {
  form?: FormInstance;
  decorators?: FormFeature[];
  subscribe?: SubscribeSetup;
  formComponentProps?: P;
  plain?: boolean;
  forwardedRef?: React.Ref<any>;
}

export type FormEntryProps<P, V = any> = FormMetaProps<P, V> &
  Omit<P, keyof FormMetaProps<P, V>>;

export function asFormContainer<P extends { [key: string]: any }, V = any>({
  getDerivedProps = (formComponentProps, injectProps) => ({
    ...formComponentProps,
    ...injectProps
  })
}: ContainerTransformOptions<P> = {}) {
  return function decorate(
    ContainerComponent: React.ComponentType<P>
  ): React.ComponentType<FormEntryProps<P, V>> {
    const DecoratedContainerComponent: React.ForwardRefRenderFunction<
      FormInstance,
      FormEntryProps<P, V>
    > = (
      {
        forwardedRef,
        form,
        decorators,
        subscribe,
        formComponentProps,
        plain,

        // FormConfig
        onFinish,
        onFinishFailed,
        initialValues,
        // CreateValidationFeatureOptions
        triggers,
        debounce,

        // RegistryEntry
        fields,

        // FormValidateCallOptions
        abortEarly,

        children,
        ...rest
      },
      ref
    ) => {
      const [formInstance] = useForm(form);
      useFormConfig(formInstance, { initialValues, triggers, debounce, plain });
      useImperativeHandle(ref, () => formInstance);
      useDecorators(formInstance, decorators);
      useSetup(formInstance, subscribe);
      const [registry] = useRegistry({
        fields,
        formComponent: ContainerComponent
      });

      const injectProps = {
        async onSubmit(event: React.FormEvent<HTMLFormElement>) {
          event.preventDefault();
          event.stopPropagation();
          if (formInstance.validating) {
            return;
          }
          const errors = await formInstance.validateFields({ abortEarly });
          if (Array.isArray(errors)) {
            onFinishFailed?.(errors);
          } else {
            onFinish?.(formInstance.values as V);
          }
        },
        onReset(event: React.FormEvent<HTMLFormElement>) {
          event.preventDefault();
          event.stopPropagation();
          formInstance.reset();
        }
      };

      const ownFormComponentProps = {
        ...((rest as unknown) as P),
        ...formComponentProps
      };
      return (
        <ContainerComponent
          {...getDerivedProps(ownFormComponentProps, injectProps)}
          ref={forwardedRef}
        >
          <RegistryContext.Provider value={registry}>
            <FieldContext.Provider value={formInstance}>
              {children}
            </FieldContext.Provider>
          </RegistryContext.Provider>
        </ContainerComponent>
      );
    };

    const name = ContainerComponent.displayName || ContainerComponent.name;
    DecoratedContainerComponent.displayName = `FormContainer(${name})`;

    return React.forwardRef(DecoratedContainerComponent) as any;
  };
}
