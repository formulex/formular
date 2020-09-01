import React from 'react';
import { useFormInstance } from './useFormInstance';
import type { FieldProps } from '../components/FieldWrapper';
import { FieldInstance, FormInstance, shallowEqual } from '@formular/core';
import { useWhenValueChanges } from '../use';

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
  const [, forceUpdate] = React.useState({});

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

  useWhenValueChanges(show, () => {
    fieldRef.current?.setShow(show!);
  });

  useWhenValueChanges(disabled, () => {
    fieldRef.current?.setDisabled(disabled!);
  });

  useWhenValueChanges(ignored, () => {
    fieldRef.current?.setIgnored(ignored!);
  });

  useWhenValueChanges(plain, () => {
    fieldRef.current?.setPlain(plain!);
  });

  useWhenValueChanges(
    rule,
    () => {
      fieldRef.current?.validation.setRules(rule!);
    },
    shallowEqual
  );

  return [fieldRef.current, form];
}
