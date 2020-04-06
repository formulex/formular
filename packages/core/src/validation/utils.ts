import { ValidationErrors } from './types';

export function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
}

export function mergeWithoutType(
  arrayOfErrors: (Omit<ValidationErrors, '$$typeof'> | null)[]
): Omit<ValidationErrors, '$$typeof'> | null {
  const res: { [key: string]: any } = arrayOfErrors.reduce(
    (
      res: Omit<ValidationErrors, '$$typeof'>,
      errors: Omit<ValidationErrors, '$$typeof'> | null
    ) => {
      return errors != null ? { ...res!, ...errors } : res!;
    },
    {}
  );
  return Object.keys(res).length === 0 ? null : res;
}

export function mergeResults(
  arrayOfErrors: (ValidationErrors | null)[]
): ValidationErrors {
  const errors: Omit<ValidationErrors, '$$typeof'>[] = [];
  const warnings: Omit<ValidationErrors, '$$typeof'>[] = [];
  for (const result of arrayOfErrors) {
    if (result) {
      const { $$typeof, ...rest } = result;
      switch ($$typeof) {
        case 'results':
          errors.push(rest.errors);
          warnings.push(rest.warnings);
          break;
        case 'error':
        default:
          errors.push(rest);
          break;
        case 'warning':
          warnings.push(rest);
          break;
      }
    }
  }
  return {
    $$typeof: 'results',
    errors: mergeWithoutType(errors),
    warnings: mergeWithoutType(warnings)
  };
}

export const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
