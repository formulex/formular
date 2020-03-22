import React from 'react';
import { Form as AntDesignForm } from 'antd';
import { Item as InnerItem, SymbolKey, FieldMeta } from '@formular/react';
import { ItemProps as InnerItemProps } from '@formular/react/lib/components/Item';
import { FormItemProps as AntDesignFormItemProps } from 'antd/lib/form/FormItem';

export interface FormItemProps<C extends React.JSXElementConstructor<any>>
  extends Omit<InnerItemProps, 'children'>,
    Omit<
      AntDesignFormItemProps,
      'name' | 'valuePropName' | 'getValueFromEvent' | 'children'
    > {
  componentProps?: PropTypeOfComponent<C>;
  component?: C;
}

type PropTypeOfComponent<C> = C extends React.ComponentType<
  FieldMeta & { componentProps: infer P }
>
  ? P
  : {};

export class FormItem<C extends any> extends React.Component<FormItemProps<C>> {
  render() {
    const {
      name,
      label,
      children,
      initialValue,
      componentProps = {},
      component,
      ...antDesignFormItemProps
    } = this.props;

    return (
      <InnerItem name={name} initialValue={initialValue}>
        {({ field, name: fieldName }) => {
          let rendered = null;
          if (component && (component as any)[SymbolKey]) {
            rendered = React.createElement(component, {
              field,
              name: fieldName,
              componentProps
            });
          } else {
            rendered = <>{children}</>;
          }
          return (
            <AntDesignForm.Item
              {...antDesignFormItemProps}
              label={label || fieldName}
            >
              {rendered}
            </AntDesignForm.Item>
          );
        }}
      </InnerItem>
    );
  }
}
