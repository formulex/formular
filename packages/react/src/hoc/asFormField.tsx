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
  type: undefined;
}

export interface FieldArrayMeta {
  field: FieldInstance;
  form: FormInstance;
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

export interface GetDerivedPropsFromFieldMetaSource<P, CP> {
  fieldComponentProps: P;
  meta: FieldUnionMeta;
  componentProps: CP;
  Component: React.ComponentType<ConnectedComponentProps<CP>>;
}
export interface FieldTransformOptions<P, CP> {
  getDerivedPropsFromFieldMeta?: (
    source: GetDerivedPropsFromFieldMetaSource<P, CP>
  ) => P;
}

export interface FieldMetaProps<P, CP>
  extends FieldRegisterConfig,
    FieldValidationConfig {
  fieldComponentProps?: P;
  name: string;
  componentProps?: CP;
  component: React.ComponentType<ConnectedComponentProps<CP>> | string;
  type?: 'array';
  plain?: boolean;
  enum?: any[];
  disabled?: boolean;
  loading?: boolean;
}

export type FieldEntryProps<P, CP = any> = FieldMetaProps<P, CP> &
  Omit<P, keyof FieldMetaProps<P, CP>>;

export function asFormField<P extends { [key: string]: any }>({
  getDerivedPropsFromFieldMeta = ({ fieldComponentProps }) => ({
    ...fieldComponentProps
  })
}: FieldTransformOptions<P, any> = {}) {
  return function decorate<CP>(
    ItemComponent: React.ComponentType<P>
  ): React.ComponentType<FieldEntryProps<P, CP>> {
    const DecoratedFieldComponent: React.FC<
      FieldMetaProps<P, CP> & { forwardedRef: React.Ref<any> }
    > = ({
      forwardedRef,
      fieldComponentProps,
      name,
      component,
      componentProps,
      type,
      plain,
      enum: enums,
      initialValue,
      disabled,
      loading,

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
        debounce,
        disabled,
        loading
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

      return (
        <ItemComponent
          {...getDerivedPropsFromFieldMeta({
            componentProps,
            fieldComponentProps: ownFieldComponentProps,
            meta:
              type === 'array'
                ? {
                    field: fieldInstance,
                    form: formInstance,
                    type,
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
                : { field: fieldInstance, form: formInstance, type },
            Component
          })}
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
