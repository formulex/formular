import React from 'react';
import { Form as AntdForm } from 'antd';
import {
  FieldProps,
  FieldWrapper,
  AtomFieldRendererProps,
  AtomFieldRenderer
} from '@formular/react';
import type { FormItemProps } from 'antd/lib/form';

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  IGNORED: 'default'
};

interface FormularAntdFieldBaseProps<CP>
  extends Partial<FieldProps>,
    Partial<Omit<AtomFieldRendererProps<CP>, '$source'>> {}

export interface FormularAntdFieldProps<CP>
  extends FormularAntdFieldBaseProps<CP>,
    Omit<FormItemProps, keyof FormularAntdFieldBaseProps<CP>> {}

export function Field<CP extends Record<string, any>>({
  name,
  initialValue,
  perishable,
  show,
  disabled,
  ignored,
  plain,
  enum: enums,
  validateFirst,
  validateTrigger,
  rules,
  messageVariables,
  validateMessages,
  component,
  componentProps,
  children,
  style,
  ...rest
}: React.PropsWithChildren<FormularAntdFieldProps<CP>>): React.ReactElement {
  if (typeof name === 'string' && name && component) {
    return (
      <FieldWrapper
        {...{
          name,
          initialValue,
          perishable,
          show,
          disabled,
          ignored,
          plain,
          enum: enums,
          validateFirst,
          validateTrigger,
          rules,
          messageVariables,
          validateMessages
        }}
      >
        {($source) => {
          const { field, form } = $source;
          const computedStyled = field.show
            ? { ...style }
            : {
                display: 'none',
                ...style
              };

          return (
            <AntdForm.Item
              style={computedStyled}
              {...rest}
              validateStatus={
                ((field.touched || form.everValitated.has(field.name)) &&
                  validateMapper[field.validation.status]) ||
                undefined
              }
              help={
                (field.touched || form.everValitated.has(field.name)) &&
                !field.ignored &&
                field.validation.errors.join(', ')
              }
            >
              <AtomFieldRenderer
                component={component}
                componentProps={componentProps}
                $source={$source}
              />
              {children}
            </AntdForm.Item>
          );
        }}
      </FieldWrapper>
    );
  }

  return <AntdForm.Item {...rest}>{children}</AntdForm.Item>;
}
