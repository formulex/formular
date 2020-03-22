import React from 'react';
import { FieldMeta } from '../hooks/useField';
import { observer } from 'mobx-react';

export interface DecorateOptions {
  valuePropName?: string;
  getValueFromEvent?: (...args: any[]) => any;
  trigger?: string;
}

export const defaultGetValueFromEvent: (...args: any[]) => any = e =>
  e.target.value;

export const SymbolKey =
  typeof Symbol === 'function'
    ? Symbol.for('FormularDecorated')
    : '__FORMULAR_DECORATED__';

export function decorate({
  valuePropName = 'value',
  getValueFromEvent = defaultGetValueFromEvent,
  trigger = 'onChange'
}: DecorateOptions = {}) {
  return (Component: React.JSXElementConstructor<any>) => {
    const decoratedComponent = observer(
      ({
        field,
        name,
        componentProps = {}
      }: FieldMeta & { componentProps?: { [key: string]: any } }) => {
        return React.createElement(Component, {
          ...componentProps,
          [valuePropName]: field.value || '',
          [trigger]: (event: any, ...rest: any[]) => {
            field.setValue(getValueFromEvent(event, ...rest));
            if (typeof componentProps[trigger] === 'function') {
              componentProps[trigger](event, ...rest);
            }
          }
        });
      }
    );
    (decoratedComponent as any)[SymbolKey] = true;
    return decoratedComponent;
  };
}
