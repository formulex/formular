import React from 'react';
import { Form as AntDesignForm } from 'antd';
import type { FormProps as AntDesignFormProps } from 'antd/lib/form/Form';
import {
  Form as InnerForm,
  FormProps as InnerFormProps
} from '@formular/react';

type InnerFormPropsType<V, XFP> = Omit<
  InnerFormProps<V, XFP>,
  'formComponent' | 'formComponentProps'
>;

type ExplicitInnerFormProps<V, XFP> = Pick<
  InnerFormPropsType<V, XFP>,
  'subscribe' | 'onFinish' | 'form'
>;

export interface FormProps<V, XFP>
  extends ExplicitInnerFormProps<V, XFP>,
    Omit<
      AntDesignFormProps,
      keyof ExplicitInnerFormProps<V, XFP> | 'onFinishFailed'
    > {
  $formMetaProps?: InnerFormPropsType<V, XFP>;
}

export const Form: React.FC<FormProps<
  any,
  AntDesignFormProps
>> = React.forwardRef(
  (
    { $formMetaProps, subscribe, onFinish, form, children, ...restProps },
    ref
  ) => {
    return (
      <InnerForm
        {...$formMetaProps}
        {...{ subscribe, onFinish, form }}
        formComponentProps={restProps}
        formComponent={AntDesignForm}
        ref={ref as any}
      >
        {children}
      </InnerForm>
    );
  }
);
