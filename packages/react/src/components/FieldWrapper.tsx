import React from 'react';
import type {
  FieldRegisterConfig,
  FieldInstance,
  FormInstance
} from '@formular/core';
import { useField } from '../hook/useField';
import { Observer } from 'mobx-react';

export interface FieldProps extends FieldRegisterConfig {
  name: string;
}

export interface FieldWrapperProps extends FieldProps {
  children: ({
    field,
    form
  }: {
    field: FieldInstance;
    form: FormInstance;
  }) => React.ReactNode;
}

function isRenderFunction(
  children: any
): children is FieldWrapperProps['children'] {
  return typeof children === 'function';
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  name,
  initialValue,
  perishable,
  validateFirst,
  validateTrigger,
  rule,
  messageVariables,
  validateMessages,
  show,
  disabled,
  ignored,
  plain,
  children,
  ...rest
}) => {
  if (!name) {
    throw new Error(
      'prop name cannot be undefined in <FieldWrapper> component'
    );
  }
  const [fieldInstance, form] = useField({
    name,
    initialValue,
    perishable,
    validateFirst,
    validateTrigger,
    rule,
    messageVariables,
    validateMessages,
    show,
    disabled,
    ignored,
    plain
  });

  if (!fieldInstance) {
    return null;
  }

  if (isRenderFunction(children)) {
    return (
      <Observer>
        {() => <>{children({ field: fieldInstance, form })}</>}
      </Observer>
    );
  }

  return null;
};

FieldWrapper.displayName = 'FieldWrapper';
