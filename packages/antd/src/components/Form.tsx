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
  'subscribe' | 'onFinish' | 'onFinishFailed' | 'form' | 'editable'
>;

export interface FormProps<V, XFP>
  extends ExplicitInnerFormProps<V, XFP>,
    Omit<AntDesignFormProps, keyof ExplicitInnerFormProps<V, XFP>> {
  $formMetaProps?: InnerFormPropsType<V, XFP>;
  onSubmit?: (e: any) => any;
}

export const AntDesignInnerFormComponent: React.FC<any> = ({
  onSubmit,
  __onInnerSubmit,
  ...rest
}) => <form {...rest} onSubmit={__onInnerSubmit ?? onSubmit} />;

export const Form: React.FC<FormProps<
  any,
  AntDesignFormProps
>> = React.forwardRef(
  (
    {
      $formMetaProps,
      subscribe,
      onFinish,
      onFinishFailed,
      editable,
      form,
      children,
      ...restProps
    },
    ref
  ) => {
    return (
      <InnerForm
        {...$formMetaProps}
        {...{ subscribe, onFinish, onFinishFailed, form, editable }}
        formComponentProps={{
          ...restProps,
          component: AntDesignInnerFormComponent
        }}
        formComponent={AntDesignForm}
        ref={ref as any}
      >
        {children}
      </InnerForm>
    );
  }
);
