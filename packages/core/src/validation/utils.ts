import { ValidationErrors } from './types';

export function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
}

export function mergeErrors(
  arrayOfErrors: (ValidationErrors | null)[]
): ValidationErrors | null {
  const res: { [key: string]: any } = arrayOfErrors.reduce(
    (res: ValidationErrors, errors: ValidationErrors | null) => {
      return errors != null ? { ...res!, ...errors } : res!;
    },
    {}
  );
  return Object.keys(res).length === 0 ? null : res;
}

export const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
