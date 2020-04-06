import {
  ValidatorOrValidatorFactory,
  ValidatorFn,
  AsyncValidatorFn,
  ValidatorFnFactory,
  AsyncValidatorFnFactory
} from './types';
import presets from './presets';
import { warningAssert } from '../utils';

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
