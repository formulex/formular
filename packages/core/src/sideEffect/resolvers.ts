import { FormInstance, FieldInstance } from '../models';
import { escapeRegexTokens, setIn } from '../utils';
import type { PatternSubscribeSetup } from './types';
import { autorun, untracked } from 'mobx';

export interface Resolvers {
  field: (name: string) => FieldInstance | undefined;
  value: <V>(name: string) => V | undefined;
  fieldsPattern: (
    pattern: string,
    subscription: PatternSubscribeSetup
  ) => () => void;
}

export function getResolvers(form: FormInstance): Resolvers {
  function field(name: string): FieldInstance | undefined {
    return form.resolve(name);
  }

  function value<V = any>(name: string): V | undefined {
    const field = form.resolve(name);
    if (!field) {
      return undefined;
    }
    if (Array.isArray(field.value)) {
      const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[\\d+].*`);
      const first = new RegExp(`^${escapeRegexTokens(name)}`);
      let result = [...field.value];
      for (const [key, targetField] of Array.from(form.fields.entries())) {
        if (pattern.test(key)) {
          result = [
            ...(setIn(
              result,
              key.replace(first, ''),
              targetField.value
            ) as any[])
          ];
        }
      }
      return (result as any) as V;
    } else {
      return field.value;
    }
  }

  function fieldsPattern(
    pattern: string,
    subscription: PatternSubscribeSetup
  ): () => void {
    const reg = new RegExp(pattern);
    let unsubscriptions: (() => void)[] = [];
    const disposer = autorun(() => {
      [...form.fields.keys()];
      untracked(() => {
        unsubscriptions.forEach((f) => f());
        unsubscriptions = [];
        form.fields.forEach((field, key) => {
          const tokens = reg.exec(key);
          if (tokens) {
            const gen = subscription(field, tokens);
            for (const unsubscribe of gen) {
              if (typeof unsubscribe === 'function') {
                unsubscriptions.push(unsubscribe);
              }
            }
          }
        });
      });
    });
    return () => {
      unsubscriptions.forEach((f) => f());
      disposer();
    };
  }

  return {
    field,
    fieldsPattern,
    value
  };
}

export function runWithResolvers<R>(
  form: FormInstance,
  f: (resolvers: Resolvers) => R
): R {
  return f(getResolvers(form));
}
