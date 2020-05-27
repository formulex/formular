import { FormInstance, FieldInstance } from '../models';
import { escapeRegexTokens, setIn } from '../utils';

export interface Resolvers {
  field: (name: string) => FieldInstance | undefined;
  value: <V>(name: string) => V | undefined;
  fieldsPattern: (
    pattern: string,
    forEachCallbackfn: (
      value: FieldInstance,
      key: string,
      map: Map<string, FieldInstance>,
      tokensArray: RegExpExecArray
    ) => void
  ) => void;
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
    forEachCallbackfn: (
      value: FieldInstance,
      key: string,
      map: Map<string, FieldInstance>,
      tokensArray: RegExpExecArray
    ) => void
  ): void {
    const reg = new RegExp(pattern);
    form.fields.forEach((_, key, _map) => {
      const tokens = reg.exec(key);
      if (tokens) {
        forEachCallbackfn(_, key, _map, tokens);
      }
    });
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
