import {
  ValidationErrors,
  ValidatorFn,
  ValidateStrategy,
  AsyncValidatorFn,
  AsyncValidateStrategy
} from './types';
import pAny from 'p-any';

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

export function compose(
  validators: ValidatorFn[],
  options: { strategy: ValidateStrategy } = { strategy: 'all' }
): ValidatorFn | null {
  if (!validators.length) {
    return null;
  }
  switch (options.strategy) {
    case 'all':
    default:
      return (field) => mergeResults(validators.map((v) => v(field)));
    case 'bail':
      return (field) => {
        const results: (ValidationErrors | null)[] = [];
        for (const v of validators) {
          const errorOrNull = v(field);
          if (errorOrNull) {
            if (errorOrNull.$$typeof === 'warning') {
              results.push(errorOrNull);
            } else if (errorOrNull.$$typeof === 'error') {
              return mergeResults([...results, errorOrNull]);
            }
          }
        }
        return mergeResults([...results]);
      };
  }
}

export function composeAsync(
  asyncValidators: AsyncValidatorFn[],
  options: { strategy: AsyncValidateStrategy } = { strategy: 'parallel' }
): AsyncValidatorFn | null {
  if (!asyncValidators.length) {
    return null;
  }
  switch (options.strategy) {
    case 'parallel':
    default:
      return async (field) => {
        return mergeResults(
          await Promise.all(asyncValidators.map((v) => v(field)))
        );
      };
    case 'parallelBail':
      return async (field) => {
        const results: (ValidationErrors | null)[] = [];
        const firstError = await pAny<ValidationErrors | null>(
          asyncValidators.map((v) => v(field)),
          {
            filter: (errorOrNull) => {
              if (errorOrNull) {
                if (errorOrNull.$$typeof === 'warning') {
                  results.push(errorOrNull);
                } else if (errorOrNull.$$typeof === 'error') {
                  return true;
                }
              }
              return false;
            }
          }
        );
        return mergeResults([...results, firstError]);
      };
    case 'series':
      return async (field) => {
        const result: (ValidationErrors | null)[] = [];
        for (const v of asyncValidators) {
          result.push(await v(field));
        }
        return mergeResults(result);
      };
    case 'seriesBail':
      return async (field) => {
        const results: (ValidationErrors | null)[] = [];
        for (const v of asyncValidators) {
          const errorOrNull = await v(field);
          if (errorOrNull) {
            if (errorOrNull.$$typeof === 'warning') {
              results.push(errorOrNull);
            } else if (errorOrNull.$$typeof === 'error') {
              return mergeResults([...results, errorOrNull]);
            }
          }
        }
        return mergeResults([...results]);
      };
  }
}
