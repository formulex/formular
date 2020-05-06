import { useFieldContext } from '../contexts';
import { useEffect, useRef, useState } from 'react';
import type {
  FieldInstance,
  FieldRegisterConfig,
  FieldValidationConfig
} from '@formular/core';
import { isFieldInstance } from '@formular/core';

const noop = () => {};

export function useField(
  name: string,
  {
    initialValue,
    type,
    rule,
    asyncRule
  }: FieldRegisterConfig & FieldValidationConfig
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
    let unapply = noop;
    if (
      isFieldInstance(fieldRef.current) &&
      typeof rule === 'object' &&
      rule !== null
    ) {
      unapply = fieldRef.current.validation.applyRule(rule);
    }
    return unapply;
  }, [rule]);

  useEffect(() => {
    let unapply = noop;
    if (
      isFieldInstance(fieldRef.current) &&
      typeof asyncRule === 'object' &&
      asyncRule !== null
    ) {
      unapply = fieldRef.current.validation.applyAsyncRule(asyncRule);
    }
    return unapply;
  }, [asyncRule]);

  useEffect(() => {
    if (isFieldInstance(fieldRef.current) && type !== fieldRef.current.type) {
      fieldRef.current?.setType(type);
    }
  }, [type]);

  return [fieldRef.current];
}
