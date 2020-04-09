import { types, Instance, getEnv, getType, getRoot } from 'mobx-state-tree';
import {
  ValidateStrategy,
  AsyncValidateStrategy,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn
} from '../validation/types';
import {
  mergeResults,
  compose,
  composeAsync,
  anError,
  aWarning
} from '../validation';
import { FormEnvironment } from '.';
import { FormInstance } from './form';

export const Field = types
  .model('Field', {
    initialValue: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    ),
    _value: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    ),
    validatorKeys: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    asyncValidatorKeys: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    _validateStrategy: types.maybe(
      types.enumeration<ValidateStrategy>('validateStrategy', ['all', 'bail'])
    ),
    _asyncValidateStrategy: types.maybe(
      types.enumeration<AsyncValidateStrategy>('asyncValidateStrategy', [
        'parallel',
        'parallelBail',
        'series',
        'seriesBail'
      ])
    ),
    rulesResults: types.maybeNull(types.frozen()),
    reactionsResults: types.maybeNull(types.frozen())
  })
  .actions((self) => ({
    setValue(val?: string | number | boolean | null) {
      self._value = val === '' ? undefined : val;
    },
    setRulesResults(result: any | null) {
      self.rulesResults = result;
    },
    addError(error: ValidationErrors | null) {
      const inputError = error ? anError(error) : null;
      self.reactionsResults = mergeResults([self.reactionsResults, inputError]);
    },
    addWarning(warning: ValidationErrors | null) {
      const inputWarning = warning ? aWarning(warning) : null;
      self.reactionsResults = mergeResults([
        self.reactionsResults,
        inputWarning
      ]);
    }
  }))
  .views((self) => ({
    get validators(): ValidatorFn[] {
      const { validators } = getEnv<FormEnvironment>(self);
      return self.validatorKeys
        .map((nameWithOrWithoutArgs) =>
          nameWithOrWithoutArgs
            ? (validators.resolveValidator(
                nameWithOrWithoutArgs
              ) as ValidatorFn | null)
            : null
        )
        .filter((fn) => typeof fn === 'function') as ValidatorFn[];
    },
    get asyncValidators(): AsyncValidatorFn[] {
      const { validators } = getEnv<FormEnvironment>(self);
      return self.asyncValidatorKeys
        .map((nameWithOrWithoutArgs) =>
          nameWithOrWithoutArgs
            ? (validators.resolveValidator(
                nameWithOrWithoutArgs
              ) as AsyncValidatorFn | null)
            : null
        )
        .filter((fn) => typeof fn === 'function') as AsyncValidatorFn[];
    },
    get validateStrategy(): ValidateStrategy {
      return (
        self._validateStrategy || getRoot<FormInstance>(self).validateStrategy
      );
    },
    get asyncValidateStrategy(): AsyncValidateStrategy {
      return (
        self._asyncValidateStrategy ||
        getRoot<FormInstance>(self).asyncValidateStrategy
      );
    },
    get results(): ValidationErrors | null {
      return mergeResults([self.rulesResults, self.reactionsResults]);
    },

    get value() {
      return self._value;
    },
    set value(val: string | number | boolean | undefined | null) {
      self.setValue(val);
    }
  }))
  .views((self) => ({
    get validator(): ValidatorFn | null {
      return compose(self.validators, { strategy: self.validateStrategy });
    },
    get asyncValidator() {
      return composeAsync(self.asyncValidators, {
        strategy: self.asyncValidateStrategy
      });
    },
    get errors() {
      return self.results;
    },
    get warnings() {
      return self.results;
    },
    set errors(error: ValidationErrors | null) {
      self.addError(error);
    },
    set warnings(error: ValidationErrors | null) {
      self.addWarning(error);
    }
  }))
  .actions((self) => ({
    setInitialValue(val?: string | number | boolean | null) {
      self.initialValue = val === '' ? undefined : val;
    },
    setFieldValidateStrategy(strategy: ValidateStrategy) {
      self._validateStrategy = strategy;
    },
    setFieldAsyncValidateStrategy(strategy: AsyncValidateStrategy) {
      self._asyncValidateStrategy = strategy;
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
  .actions((self) => ({
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
    },
    async validate(): Promise<void> {
      const errors = self.runValidator();
      if (errors) {
        self.setRulesResults(errors);
        return;
      }
      const asyncErrors = await self.runAsyncValidator();
      if (asyncErrors) {
        self.setRulesResults(asyncErrors);
        return;
      }
      self.setRulesResults(null);
    }
  }));

export type FieldInstance = Instance<typeof Field>;

export function createField(value?: string | number | boolean): FieldInstance {
  return Field.create({
    _value: value,
    validatorKeys: [],
    asyncValidatorKeys: []
  });
}

export function isFieldInstance(node: any): node is FieldInstance {
  return getType(node) === Field;
}
