import React from 'react';
import { RenderableProps, renderComponent } from '../utils';
import { Observer } from 'mobx-react';
import { useField } from '../hooks';
import { FieldInstance, FieldRegisterConfig } from '@formular/core';

export interface FieldsAPI {
  name: string;
  value: any[];
  length: number;
  map: (iterator: (name: string, index: number) => any) => any[];
  forEach: (iterator: (name: string, index: number) => void) => void;
}

export interface FieldRenderableProps {
  field: FieldInstance;
  fields: FieldsAPI;
  type?: 'array';
}

export interface ItemProps
  extends RenderableProps<FieldRenderableProps>,
    FieldRegisterConfig {
  name: string;
  type?: 'array';
}

export const Item: React.FC<ItemProps> = ({
  children,
  component,
  render,
  name,
  type,
  initialValue
}) => {
  const [field] = useField(name, { type, initialValue });
  return (
    <Observer key={`_field_${name}`}>
      {() =>
        (field &&
          (type === 'array'
            ? (renderComponent<FieldRenderableProps>(
                { children, render, component },
                {
                  field,
                  fields: {
                    name,
                    value: field.value,
                    length: field.value?.length,
                    map: (
                      iterator: (name: string, index: number) => any
                    ): any[] => {
                      const len = field.value?.length || 0;
                      const results: any[] = [];
                      for (let i = 0; i < len; i++) {
                        results.push(iterator(`${name}[${i}]`, i));
                      }
                      return results;
                    },
                    forEach: (
                      iterator: (name: string, index: number) => void
                    ): void => {
                      const len = field.value?.length || 0;
                      for (let i = 0; i < len; i++) {
                        iterator(`${name}[${i}]`, i);
                      }
                    }
                  },
                  type
                },
                'FormularArray'
              ) as any)
            : (renderComponent(
                { children, render, component },
                {
                  field,
                  fields: {
                    name,
                    value: field.value,
                    length: 0,
                    map: () => {
                      throw new Error(
                        `Cannot call "map" in NOT array-like field "${name}" with type="${type}"`
                      );
                    },
                    forEach: () => {
                      throw new Error(
                        'Cannot call "forEach" in NOT array-like field:' + name
                      );
                    }
                  },
                  type
                },
                'FormularItem'
              ) as any))) ||
        null
      }
    </Observer>
  );
};

Item.displayName = 'FormularItem';
