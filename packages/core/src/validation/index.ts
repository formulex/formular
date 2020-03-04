import {
  ValidatorFn,
  ValidatorOrValidatorFactory,
  ValidatorFnFactory,
  AsyncValidatorFn,
  AsyncValidatorFnFactory,
  ValidateStrategy,
  ValidationErrors,
  AsyncValidateStrategy
} from './types';
import { warning } from '../utils';
import pAny from 'p-any';

function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
}

function mergeErrors(arrayOfErrors: (ValidationErrors | null)[]): ValidationErrors | null {
  const res: { [key: string]: any } = arrayOfErrors.reduce(
    (res: ValidationErrors, errors: ValidationErrors | null) => {
      return errors != null ? { ...res!, ...errors } : res!;
    },
    {}
  );
  return Object.keys(res).length === 0 ? null : res;
}

const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class Validators {
  private static _dictionary = new Map<string, ValidatorOrValidatorFactory>([
    [
      'required',
      (field => {
        return isEmptyInputValue(field.value) ? { required: true } : null;
      }) as ValidatorFn
    ],
    [
      'min',
      ((min: number) => field => {
        if (isEmptyInputValue(field.value) || isEmptyInputValue(min)) {
          return null; // don't validate empty values to allow optional controls
        }
        const value = Number.parseFloat(field.value as any);
        // Fields with NaN values after parsing should be treated as not having a
        // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
        return !Number.isNaN(value) && value < min
          ? { min: { min: min, actual: field.value } }
          : null;
      }) as ValidatorFnFactory
    ],
    [
      'max',
      ((max: number) => field => {
        if (isEmptyInputValue(field.value) || isEmptyInputValue(max)) {
          return null; // don't validate empty values to allow optional controls
        }
        const value = Number.parseFloat(field.value as any);
        // Fields with NaN values after parsing should be treated as not having a
        // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
        return !Number.isNaN(value) && value > max
          ? { max: { max: max, actual: field.value } }
          : null;
      }) as ValidatorFnFactory
    ],
    [
      'email',
      (field => {
        if (isEmptyInputValue(field.value)) {
          return null; // don't validate empty values to allow optional controls
        }
        return EMAIL_REGEXP.test(field.value as any) ? null : { email: true };
      }) as ValidatorFn
    ]
  ]);

  public static resolveValidator(
    validatorNameWithOrWithoutArgs: string | any[]
  ): ValidatorFn | AsyncValidatorFn | null {
    if (typeof validatorNameWithOrWithoutArgs === 'string') {
      const validator = this._dictionary.get(validatorNameWithOrWithoutArgs) as
        | ValidatorFn
        | AsyncValidatorFn
        | undefined;

      if (typeof validator !== 'function') {
        warning(false, `Cannot find validator with name "${validatorNameWithOrWithoutArgs}"`);
        return null;
      }
      return validator;
    } else if (Array.isArray(validatorNameWithOrWithoutArgs)) {
      const [name, ...args] = validatorNameWithOrWithoutArgs;
      if (typeof name !== 'string') {
        warning(
          false,
          `The first element in validator name with args must be string, but got "${name}" with type "${typeof name}"`
        );
        return null;
      }
      const validatorFactory = this._dictionary.get(name) as
        | ValidatorFnFactory
        | AsyncValidatorFnFactory
        | undefined;
      if (typeof validatorFactory !== 'function') {
        warning(false, `Cannot find validator with name "${validatorNameWithOrWithoutArgs}"`);
        return null;
      }
      return validatorFactory.apply(null, args);
    } else {
      warning(
        false,
        `Expect a name or a name with args to resolve validator, but got "${validatorNameWithOrWithoutArgs}" with type "${typeof validatorNameWithOrWithoutArgs}"`
      );
      return null;
    }
  }

  public static compose(
    validators: ValidatorFn[],
    options: { strategy: ValidateStrategy } = { strategy: 'all' }
  ): ValidatorFn | null {
    if (!validators.length) {
      return null;
    }
    switch (options.strategy) {
      case 'all':
      default:
        return field => mergeErrors(validators.map(v => v(field)));
      case 'bail':
        return field => {
          for (const v of validators) {
            const errorOrNull = v(field);
            if (errorOrNull) {
              return errorOrNull;
            }
          }
          return null;
        };
    }
  }

  public static composeAsync(
    asyncValidators: AsyncValidatorFn[],
    options: { strategy: AsyncValidateStrategy } = { strategy: 'parallel' }
  ): AsyncValidatorFn | null {
    if (!asyncValidators.length) {
      return null;
    }
    switch (options.strategy) {
      case 'parallel':
      default:
        return async field => {
          return mergeErrors(await Promise.all(asyncValidators.map(v => v(field))));
        };
      case 'parallelBail':
        return async field => {
          return await pAny(
            asyncValidators.map(v => v(field)),
            {
              filter: errorOrNull => Boolean(errorOrNull)
            }
          );
        };
      case 'series':
        return async field => {
          const result: (ValidationErrors | null)[] = [];
          for (const v of asyncValidators) {
            result.push(await v(field));
          }
          return mergeErrors(result);
        };
      case 'seriesBail':
        return async field => {
          for (const v of asyncValidators) {
            const errorOrNull = await v(field);
            if (errorOrNull) {
              return errorOrNull;
            }
          }
          return null;
        };
    }
  }
}
