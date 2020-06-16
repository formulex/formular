import React from 'react';
import { observer } from 'mobx-react';
import { useField } from '../hooks';
import {
  FieldRegisterConfig,
  FieldValidationConfig,
  invariant,
  FieldInstance,
  FormInstance
} from '@formular/core';
import type { ConnectedComponentProps } from './connect';
import { useRegistryContext } from '../contexts';

export interface FieldSingleMeta {
  field: FieldInstance;
  form: FormInstance;
}

export interface FieldArrayMeta extends FieldSingleMeta {
  type: 'array';
  fields: {
    name: string;
    value: any[];
    length: number;
    map: (iterator: (name: string, index: number) => any) => any[];
    forEach: (iterator: (name: string, index: number) => void) => void;
  };
}

export type FieldUnionMeta = FieldSingleMeta | FieldArrayMeta;

export interface FieldTransformOptions<P> {
  getDerivedPropsFromFieldMeta?: (
    componentProps: P,
    meta: FieldUnionMeta,
    Component: React.ComponentType<ConnectedComponentProps<P>>
  ) => P;
}

export interface FieldMetaProps<P>
  extends FieldRegisterConfig,
    FieldValidationConfig {
  fieldComponentProps?: P;
  name: string;
  component: React.ComponentType<ConnectedComponentProps<P>> | string;
  type?: 'array';
  plain?: boolean;
  enum?: any[];
}

export type FieldEntryProps<P> = FieldMetaProps<P> &
  Omit<P, keyof FieldMetaProps<P>>;

export function asFormField<P extends { [key: string]: any }>({
  getDerivedPropsFromFieldMeta = (props) => props
}: FieldTransformOptions<P> = {}) {
  return function decorate(
    ItemComponent: React.ComponentType<P>
  ): React.ComponentType<FieldEntryProps<P>> {
    const DecoratedFieldComponent: React.FC<
      FieldMetaProps<P> & { forwardedRef: React.Ref<any> }
    > = ({
      forwardedRef,
      fieldComponentProps,
      name,
      component,
      type,
      plain,
      enum: enums,
      initialValue,

      // FieldValidationConfig
      rule,
      asyncRule,
      triggers,
      debounce,
      ...rest
    }) => {
      const registry = useRegistryContext();
      const [fieldInstance, formInstance] = useField(name, {
        type,
        initialValue,
        rule,
        asyncRule,
        plain,
        enum: enums,
        triggers,
        debounce
      });
      if (!fieldInstance) {
        return null;
      }

      let Component = component;
      if (
        registry &&
        typeof component === 'string' &&
        registry.fields[component]
      ) {
        Component = registry.fields[component];
      }
      invariant(
        typeof Component !== 'string',
        `Cannot find component "${component}". Do you register it correctly?`
      );

      const ownFieldComponentProps = {
        ...((rest as unknown) as P),
        ...fieldComponentProps
      };

      const extraMeta: Partial<Omit<FieldArrayMeta, keyof FieldSingleMeta>> =
        type === 'array'
          ? {
              fields: {
                name,
                value: fieldInstance.value,
                length: fieldInstance.value?.length ?? 0,
                map(iterator) {
                  const len = fieldInstance.value?.length ?? 0;
                  const results: any[] = [];
                  for (let i = 0; i < len; i++) {
                    results.push(iterator(`${name}[${i}]`, i));
                  }
                  return results;
                },
                forEach(iterator) {
                  const len = fieldInstance.value?.length ?? 0;
                  for (let i = 0; i < len; i++) {
                    iterator(`${name}[${i}]`, i);
                  }
                }
              }
            }
          : {};

      return (
        <ItemComponent
          {...getDerivedPropsFromFieldMeta(
            ownFieldComponentProps,
            {
              field: fieldInstance,
              form: formInstance,
              ...extraMeta
            },
            Component
          )}
          ref={forwardedRef}
        />
      );
    };

    const name = ItemComponent.displayName || ItemComponent.name;
    DecoratedFieldComponent.displayName = `FormField(${name})`;

    const DecoratedComponent = observer(DecoratedFieldComponent);

    const forwardRef: React.ForwardRefRenderFunction<any, any> = (
      props,
      ref
    ) => <DecoratedComponent {...props} forwardedRef={ref} />;
    forwardRef.displayName = `forwardRefFormField(${name})`;

    return React.forwardRef<any, any>(forwardRef) as any;
  };
}
