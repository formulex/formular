import { types, Instance, getEnv } from 'mobx-state-tree';
import {
  ValidatorFn,
  AsyncValidatorFn,
  ValidateStrategy,
  AsyncValidateStrategy,
  ValidationErrors
} from '../validation/types';
import { FormEnvironment } from './form';
import { isFunctionPresent } from './helper';
import { compose, composeAsync } from '../validation';

export const Field = types
  .model('Field', {
    initialValue: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    ),
    value: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    ),
    validatorKeys: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    asyncValidatorKeys: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    validateStrategy: types.enumeration<ValidateStrategy>('validateStrategy', [
      'all',
      'bail'
    ]),
    asyncValidateStrategy: types.enumeration<AsyncValidateStrategy>(
      'asyncValidateStrategy',
      ['parallel', 'parallelBail', 'series', 'seriesBail']
    )
  })
  .views(self => ({
    get validators(): ValidatorFn[] {
      const { validators } = getEnv<FormEnvironment>(self);
      return self.validatorKeys
        .map(nameWithOrWithoutArgs =>
          nameWithOrWithoutArgs
            ? (validators.resolveValidator(
                nameWithOrWithoutArgs
              ) as ValidatorFn | null)
            : null
        )
        .filter(isFunctionPresent);
    },
    get asyncValidators(): AsyncValidatorFn[] {
      const { validators } = getEnv<FormEnvironment>(self);
      return self.asyncValidatorKeys
        .map(nameWithOrWithoutArgs =>
          nameWithOrWithoutArgs
            ? (validators.resolveValidator(
                nameWithOrWithoutArgs
              ) as AsyncValidatorFn | null)
            : null
        )
        .filter(isFunctionPresent);
    }
  }))
  .views(self => ({
    get validator(): ValidatorFn | null {
      return compose(self.validators, { strategy: self.validateStrategy });
    },
    get asyncValidator() {
      return composeAsync(self.asyncValidators, {
        strategy: self.asyncValidateStrategy
      });
    }
  }))
  .actions(self => ({
    setValue(val?: string | number | boolean | null) {
      self.value = val === '' ? undefined : val;
    },
    setInitialValue(val?: string | number | boolean | null) {
      self.initialValue = val === '' ? undefined : val;
    },
    setValidateStrategy(strategy: ValidateStrategy) {
      self.validateStrategy = strategy;
    },
    setAsyncValidateStrategy(strategy: AsyncValidateStrategy) {
      self.asyncValidateStrategy = strategy;
    },
    setValidatorKeys(keys: Array<string | any[]>) {
      self.validatorKeys.replace(keys);
    },
    setAsyncValidatorKeys(keys: Array<string | any[]>) {
      self.asyncValidatorKeys.replace(keys);
    },
    clearValidators() {
      self.validatorKeys.clear();
    },
    clearAsyncValidators() {
      self.asyncValidatorKeys.clear();
    },
    runValidator(): ValidationErrors | null {
      return self.validator ? self.validator(self as any) : null;
    },
    async runAsyncValidator(): Promise<ValidationErrors | null> {
      if (self.asyncValidator) {
        return self.asyncValidator(self as any);
      }
      return null;
    }
  }))
  .actions(self => ({
    patchValue(val?: string | number | boolean | null) {
      self.setValue(val);
    },
    patchInitialValue(val?: string | number | boolean | null) {
      self.setInitialValue(val);
    },
    afterCreate() {
      self.setInitialValue(self.value);
    },
    async reset() {
      self.setValue(self.initialValue);
    },
    clear() {
      self.setValue(null);
    }
  }));

export type FieldInstance = Instance<typeof Field>;

export function createField(value?: string | number | boolean): FieldInstance {
  return Field.create({
    value,
    validateStrategy: 'all',
    asyncValidateStrategy: 'parallel',
    validatorKeys: [],
    asyncValidatorKeys: []
  });
}
