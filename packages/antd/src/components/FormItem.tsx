import React from 'react';
import { Form as AntDesignForm } from 'antd';
import { Item as InnerItem, SymbolKey } from '@formular/react';
import { ItemProps as InnerItemProps } from '@formular/react/lib/components/Item';
import { FormItemProps as AntDesignFormItemProps } from 'antd/lib/form/FormItem';

export interface FormItemProps
  extends Omit<InnerItemProps, 'children'>,
    Omit<
      AntDesignFormItemProps,
      'name' | 'valuePropName' | 'getValueFromEvent' | 'children'
    > {
  componentProps?: { [key: string]: any };
  component?: React.JSXElementConstructor<any>;
}

export const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  children,
  initialValue,
  componentProps = {},
  component,
  ...antDesignFormItemProps
}) => {
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
};
