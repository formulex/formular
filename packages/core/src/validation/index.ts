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
import { warningAssert } from '../utils';
import pAny from 'p-any';
import presets from './presets';
import { mergeResults } from './utils';
export { mergeWithoutType, mergeResults } from './utils';

export class Validators {
  private static _dictionary = new Map<string, ValidatorOrValidatorFactory>(
    presets
  );

  private _selfDictionary = new Map<string, ValidatorOrValidatorFactory>();

  public static registerValidator(
    name: string,
    validatorOrFactory: ValidatorOrValidatorFactory
  ) {
    this._dictionary.set(name, validatorOrFactory);
  }

  public registerValidator(
    name: string,
    validatorOrFactory: ValidatorOrValidatorFactory
  ) {
    this._selfDictionary.set(name, validatorOrFactory);
  }

  public resolveValidator(
    validatorNameWithOrWithoutArgs: string | any[]
  ): ValidatorFn | AsyncValidatorFn | null {
    if (typeof validatorNameWithOrWithoutArgs === 'string') {
      const validator = (this._selfDictionary.get(
        validatorNameWithOrWithoutArgs
      ) || Validators._dictionary.get(validatorNameWithOrWithoutArgs)) as
        | ValidatorFn
        | AsyncValidatorFn
        | undefined;

      if (typeof validator !== 'function') {
        warningAssert(
          false,
          `Cannot find validator with name "${validatorNameWithOrWithoutArgs}"`
        );
        return null;
      }

      return validator;
    } else if (Array.isArray(validatorNameWithOrWithoutArgs)) {
      const [name, ...args] = validatorNameWithOrWithoutArgs;
      if (typeof name !== 'string') {
        warningAssert(
          false,
          `The first element in validator name with args must be string, but got "${name}" with type "${typeof name}"`
        );
        return null;
      }
      const validatorFactory = (this._selfDictionary.get(name) ||
        Validators._dictionary.get(name)) as
        | ValidatorFnFactory
        | AsyncValidatorFnFactory
        | undefined;
      if (typeof validatorFactory !== 'function') {
        warningAssert(
          false,
          `Cannot find validator with name "${validatorNameWithOrWithoutArgs}"`
        );
        return null;
      }
      return validatorFactory(args);
    } else {
      warningAssert(
        false,
        `Expect a name or a name with args to resolve validator, but got "${validatorNameWithOrWithoutArgs}" with type "${typeof validatorNameWithOrWithoutArgs}"`
      );
      return null;
    }
  }
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
