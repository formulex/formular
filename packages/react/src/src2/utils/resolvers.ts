import { FormInstance } from '@formular/core/lib/src2/models/form';
import { FieldInstance } from '@formular/core/lib/src2/models/field';
import { IReactionDisposer } from 'mobx';
import { escapeRegexTokens, setIn } from '@formular/core/lib/src2';

export interface ResolverContext {
  disposers: IReactionDisposer[];
}

export class ResolverContextManager {
  static stack: ResolverContext[] = [];

  static get top(): ResolverContext | undefined {
    const last = this.stack[this.stack.length - 1];
    return last;
  }

  static push(...args: ResolverContext[]) {
    return this.stack.push(...args);
  }

  static pop() {
    return this.stack.pop();
  }
}

export interface Resolvers {
  field: (name: string) => FieldInstance | undefined;
  value: <V>(name: string) => V | undefined;
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
  return {
    field,
    value
  };
}

export function withContext<R>(
  form: FormInstance,
  f: (resolvers: Resolvers) => R
): R {
  return f(getResolvers(form));
}
