import React from 'react';
import FormItem, { FormItemProps } from 'antd/lib/form/FormItem';
import { asFormField, FieldEntryProps } from '@formular/react';

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  WARNING: 'warning',
  IGNORED: 'default'
};

const NamedField = asFormField<FormItemProps>({
  getDerivedPropsFromFieldMeta({
    fieldComponentProps,
    componentProps,
    meta,
    Component
  }) {
    const { field, type, form } = meta;
    const extraStyle = { display: 'none' };
    if (field.show) {
      delete extraStyle.display;
    }
    const children = React.createElement(
      Component as React.ComponentType<any>,
      { ...componentProps, $meta: meta },
      type === 'array'
        ? fieldComponentProps.children ?? (componentProps as any)?.children
        : (componentProps as any)?.children ?? fieldComponentProps.children
    );

    const common = {
      style: { ...fieldComponentProps.style, ...extraStyle },
      children
    };
    if (type === 'array') {
      return { ...fieldComponentProps, ...common };
    }
    return {
      ...fieldComponentProps,
      ...common,
      validateStatus:
        ((field.visited || form.everValitated) &&
          validateMapper[field.validation.status]) ||
        undefined,
      help:
        (field.visited || form.everValitated) &&
        !field.ignored &&
        field.validation.messages.join(', ')
    };
  }
})<any>(FormItem);

export function Field<CP>(props: Partial<FieldEntryProps<FormItemProps, CP>>) {
  const {
    name,
    component,
    componentProps,
    initialValue,
    fieldComponentProps,
    type,
    plain,
    enum: enums,
    rule,
    asyncRule,
    triggers,
    debounce,
    children,
    style,
    ...rest
  } = props;
  if (name && component) {
    return (
      <NamedField {...props} {...{ name, component, componentProps }}>
        {children}
      </NamedField>
    );
  }
  return (
    <FormItem {...rest} {...fieldComponentProps}>
      {children}
    </FormItem>
  );
}
