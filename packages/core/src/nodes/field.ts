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
  aWarning,
  getResolver
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
    _selfValidateMessages: types.map(types.string),
    rulesResults: types.maybeNull(types.frozen()),
    reactionsResults: types.maybeNull(types.frozen()),
    _isPending: types.boolean
  })
  .actions((self) => ({
    setValue(val?: string | number | boolean | null) {
      self._value = val === '' ? undefined : val;
    },
    setIsPending(pending: boolean) {
      self._isPending = pending;
    },
    setValidateMessages(messages: { [key: string]: string }) {
      self._selfValidateMessages.replace(messages);
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
    },
    get validateMessages(): { [key: string]: string } {
      return {
        ...getRoot<FormInstance>(self).validateMessages,
        ...self._selfValidateMessages.toJSON()
      };
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
    },
    get messages() {
      if (!self.results) {
        return null;
      }
      if (self.results.$$typeof === 'results') {
        const errors: string[] = [];
        const warnings: string[] = [];
        if (self.results.errors) {
          Object.keys(self.results.errors).forEach((key) => {
            const resolver = getResolver(
              self.validateMessages[key] || self.validateMessages.default
            );
            const error = self.results?.errors[key];
            const messageStr = resolver(error);
            errors.push(messageStr);
          });
        }
        if (self.results.warnings) {
          Object.keys(self.results.warnings).forEach((key) => {
            const resolver = getResolver(
              self.validateMessages[key] || self.validateMessages.default
            );
            const error = self.results?.warnings[key];
            const messageStr = resolver(error);
            warnings.push(messageStr);
          });
        }

        return {
          errors: [...new Set(errors)],
          warnings: [...new Set(warnings)]
        };
      }
      console.warn('result should with $$typeof: "result"');
      return null;
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
      self.setIsPending(true);
      if (self.asyncValidator) {
        const result = await self.asyncValidator(self as any);
        self.setIsPending(false);
        return result;
      }
      self.setIsPending(false);
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
    reset() {
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
    _isPending: false,
    validatorKeys: [],
    asyncValidatorKeys: []
  });
}

export function isFieldInstance(node: any): node is FieldInstance {
  return getType(node) === Field;
}
