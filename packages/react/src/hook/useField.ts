import React from 'react';
import { useFormInstance } from './useFormInstance';
import type { FieldProps } from '../components/FieldWrapper';
import { FieldInstance, FormInstance, shallowEqual } from '@formular/core';

export function useField({
  name,
  initialValue,
  validateFirst,
  validateTrigger,
  rule,
  messageVariables,
  validateMessages,
  perishable,
  plain,
  show,
  disabled,
  ignored,
  enum: enums
}: FieldProps): [FieldInstance | undefined, FormInstance] {
  const form = useFormInstance('useField');
  const fieldRef = React.useRef<FieldInstance>();
  const [, forceUpdate] = React.useState();

  React.useEffect(
    () =>
      form.registerField(
        name,
        (field) => {
          fieldRef.current = field;
          forceUpdate({});
          return () => {
            fieldRef.current = undefined;
          };
        },
        {
          initialValue,
          validateFirst,
          validateTrigger,
          rule,
          messageVariables,
          validateMessages,
          perishable,
          plain,
          show,
          disabled,
          ignored,
          enum: enums
        }
      ),
    [name, initialValue]
  );

  // useWhenValueChanges(
  //   enums,
  //   () => {
  //     fieldRef.current?.setEnum(enums);
  //   },
  //   shallowEqual
  // );

  return [fieldRef.current, form];
}
