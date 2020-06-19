import { useFieldContext } from '../contexts';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { FieldInstance, FormInstance, shallowEqual } from '@formular/core';
import { isFieldInstance } from '@formular/core';
import { reaction } from 'mobx';
import { FieldMetaProps } from '../hoc';

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
    debounce,
    disabled,
    loading
  }: Omit<
    FieldMetaProps<any, any>,
    'fieldComponentProps' | 'componentProps' | 'component' | 'name'
  >
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

  const ruleRef = useRef<any>();
  useEffect(() => {
    let unapply = noop;
    if (
      isFieldInstance(fieldRef.current) &&
      typeof rule === 'object' &&
      rule !== null &&
      !shallowEqual(rule, ruleRef.current)
    ) {
      unapply = fieldRef.current.validation.applyRule(rule);
      ruleRef.current = rule;
    }
    return unapply;
  }, [rule]);

  const asyncRuleRef = useRef<any>();
  useEffect(() => {
    let unapply = noop;
    if (
      isFieldInstance(fieldRef.current) &&
      typeof asyncRule === 'object' &&
      asyncRule !== null &&
      !shallowEqual(asyncRule, asyncRuleRef.current)
    ) {
      unapply = fieldRef.current.validation.applyAsyncRule(asyncRule);
      asyncRuleRef.current = rule;
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

  useEffect(() => {
    if (isFieldInstance(fieldRef.current) && typeof disabled === 'boolean') {
      fieldRef.current?.setDisabled(disabled);
    }
  }, [disabled]);

  useEffect(() => {
    if (isFieldInstance(fieldRef.current) && typeof loading === 'boolean') {
      fieldRef.current?.setLoading(loading);
    }
  }, [loading]);

  useLayoutEffect(() => {
    if (
      isFieldInstance(fieldRef.current) &&
      !shallowEqual(triggers, fieldRef.current?.validation.triggers)
    ) {
      fieldRef.current?.validation.setTriggers(triggers);
    }
  }, [triggers]);

  useLayoutEffect(() => {
    if (isFieldInstance(fieldRef.current)) {
      fieldRef.current?.validation.setDebounce(debounce);
    }
  }, [debounce]);

  return [fieldRef.current, form];
}
