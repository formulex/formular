import { useFieldContext } from '../contexts';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import type {
  FieldInstance,
  FieldRegisterConfig,
  FieldValidationConfig,
  FormInstance
} from '@formular/core';
import { isFieldInstance } from '@formular/core';
import { FieldFeatures } from '../components/Item';
import { reaction } from 'mobx';

const noop = () => {};

export function useField(
  name: string,
  {
    initialValue,
    type,
    rule,
    asyncRule,
    plain,
    enum: enums,
    triggers,
    debounce
  }: FieldRegisterConfig & FieldValidationConfig & FieldFeatures
): [FieldInstance | undefined, FormInstance] {
  const form = useFieldContext();
  const fieldRef = useRef<FieldInstance>();
  const [, forceUpdate] = useState();

  useLayoutEffect(() => {
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

  useLayoutEffect(
    () =>
      reaction(
        () => form.fields.values(),
        () => {
          if (isFieldInstance(fieldRef.current)) {
            const target = form.fields.get(name);

            if (
              target &&
              (target as any).$treenode.nodeId !==
                (fieldRef.current as any).$treenode.nodeId
            ) {
              fieldRef.current = target;
              forceUpdate({});
            }
          }
        }
      ),
    [form, name]
  );

  useLayoutEffect(() => {
    if (isFieldInstance(fieldRef.current) && type !== fieldRef.current.type) {
      fieldRef.current?.setType(type);
    }
  }, [type]);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    if (isFieldInstance(fieldRef.current) && typeof plain === 'boolean') {
      fieldRef.current?.setPlain(plain);
    }
  }, [plain]);

  useEffect(() => {
    if (isFieldInstance(fieldRef.current) && Array.isArray(enums)) {
      fieldRef.current?.setEnum(enums);
    }
  }, [enums]);

  useLayoutEffect(() => {
    if (isFieldInstance(fieldRef.current)) {
      fieldRef.current?.validation.setTriggers(triggers);
      fieldRef.current?.validation.setDebounce(debounce);
    }
  }, [triggers, debounce]);

  return [fieldRef.current, form];
}
