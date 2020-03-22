import React from 'react';
import { Form as AntDesignForm } from 'antd';
// fixme: use "import type" after prettier 2.0
import { FormProps as AntDesignFormProps } from 'antd/es/form/Form';

export interface FormProps extends AntDesignFormProps {}

export const Form: React.FC<FormProps> = ({ children, ...antdProps }) => {
  return <AntDesignForm {...antdProps}>{children}</AntDesignForm>;
};
