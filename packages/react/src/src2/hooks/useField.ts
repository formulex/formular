import { useFieldContext } from '../contexts';
import { useEffect, useRef, useState } from 'react';
import { FieldRegisterConfig } from '@formular/core/lib/src2/models/form';
import {
  FieldInstance,
  isFieldInstance
} from '@formular/core/lib/src2/models/field';

export function useField(
  name: string,
  { initialValue, type }: FieldRegisterConfig
): [FieldInstance | undefined] {
  const form = useFieldContext();
  const fieldRef = useRef<FieldInstance>();
  const [, forceUpdate] = useState();

  useEffect(() => {
    const unregister = form.registerField(name, undefined, {
      initialValue,
      type
    });
    fieldRef.current = form.fields.get(name)!;
    forceUpdate({});
    return () => {
      unregister();
      fieldRef.current = undefined;
    };
  }, [form, name]);

  useEffect(() => {
    if (
      isFieldInstance(fieldRef.current) &&
      initialValue !== fieldRef.current.initialValue
    ) {
      fieldRef.current.setFallbackInitialValue(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (isFieldInstance(fieldRef.current) && type !== fieldRef.current.type) {
      fieldRef.current?.setType(type);
    }
  }, [type]);

  return [fieldRef.current];
}
