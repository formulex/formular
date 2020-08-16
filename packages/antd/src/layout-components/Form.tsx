import React from 'react';
import { Form as AntdForm } from 'antd';
import { Formular, FormularProps } from '@formular/react';
import type { FormInstance } from '@formular/core';
import type { FormProps } from 'antd/lib/form';

const component: React.FC<any> = ({ handleSubmit, onSubmit, ...rest }) => {
  return <form {...rest} onSubmit={handleSubmit ?? onSubmit} />;
};
component.displayName = 'AntdFormCompatWrapper';

export interface FormularAntdFormProps<V>
  extends FormularProps<V>,
    Omit<FormProps, keyof FormularProps<V>> {}

export const Form = React.forwardRef<FormInstance, FormularAntdFormProps<any>>(
  (
    {
      children,
      form: alternateFormInstance,
      perishable,
      initialValues,
      onFinishFailed,
      onFinish,
      plain,
      messageVariables,
      validateMessages,
      emptyContent,
      fields,
      effects,
      ...rest
    },
    ref
  ) => {
    return (
      <Formular
        ref={ref}
        {...{
          form: alternateFormInstance,
          perishable,
          initialValues,
          onFinishFailed,
          onFinish,
          plain,
          messageVariables,
          validateMessages,
          emptyContent,
          fields,
          effects
        }}
      >
        {({ handleSubmit }) => (
          <>
            <AntdForm {...rest} {...{ component, handleSubmit }}>
              {children}
            </AntdForm>
          </>
        )}
      </Formular>
    );
  }
);
