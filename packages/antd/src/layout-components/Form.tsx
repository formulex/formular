import React from 'react';
import AntDesignForm from 'antd/lib/form/Form';
import type { FormProps as AntDesignFormProps } from 'antd/lib/form/Form';
import { asFormContainer } from '@formular/react';

export const component: React.FC<any> = ({ __onSubmit, onSubmit, ...rest }) => {
  return <form {...rest} onSubmit={__onSubmit ?? onSubmit} />;
};

export const Form = asFormContainer<AntDesignFormProps>({
  getDerivedProps(formComponentProps, injectProps) {
    return {
      ...formComponentProps,
      ...injectProps,
      __onSubmit: injectProps.onSubmit,
      component
    };
  }
})(AntDesignForm);
