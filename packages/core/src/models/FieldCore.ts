import { types } from 'mobx-state-tree';
import {
  ValidateTriggers,
  ValidationErrors,
  ValidateStrategy,
  AsyncValidateStrategy
} from '../validation/types';
import {
  StatusEnumerationType,
  VALID,
  INVALID,
  PENDING,
  DISABLED
} from '../shared';

export const FieldCore = types
  .model('FieldCore', {
    validators: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    asyncValidators: types.array(
      types.union(types.string, types.array(types.frozen()))
    ),
    validateTrigger: types.enumeration<ValidateTriggers>('validateTrigger', [
      'change',
      'blur'
    ]),
    validateStrategy: types.enumeration<ValidateStrategy>('validateStrategy', [
      'all',
      'bail'
    ]),
    asyncValidateStrategy: types.enumeration<AsyncValidateStrategy>(
      'asyncValidateStrategy',
      ['parallel', 'parallelBail', 'series', 'seriesBail']
    ),
    status: types.enumeration<StatusEnumerationType>('status', [
      VALID,
      INVALID,
      PENDING,
      DISABLED
    ]),
    errors: types.maybeNull(types.frozen<ValidationErrors>()),
    isPristine: types.optional(types.boolean, true),
    __everFoucused: types.optional(types.boolean, false),
    __everBlured: types.optional(types.boolean, false)
  })
  .views((self) => ({
    get isValid() {
      return self.status === VALID;
    },
    get isInvalid() {
      return self.status === INVALID;
    },
    get isPending() {
      return self.status === PENDING;
    },
    get isDisabled() {
      return self.status === DISABLED;
    },
    get isEnabled() {
      return self.status !== DISABLED;
    },
    get isDirty() {
      return !self.isPristine;
    },
    get isTouched() {
      return self.__everBlured && self.__everFoucused;
    }
    // get validatorFunctions(): ValidatorFn[] {
    //   const { Validators } = getEnv<typeof environment>(self);
    //   return self.validators
    //     .map(nameWithOrWithoutArgs =>
    //       nameWithOrWithoutArgs
    //         ? (Validators.resolveValidator(nameWithOrWithoutArgs) as ValidatorFn | null)
    //         : null
    //     )
    //     .filter(isPresent);
    // },
    // get asyncValidatorFunctions(): AsyncValidatorFn[] {
    //   const { Validators } = getEnv<typeof environment>(self);
    //   return self.asyncValidators
    //     .map(nameWithOrWithoutArgs =>
    //       nameWithOrWithoutArgs
    //         ? (Validators.resolveValidator(nameWithOrWithoutArgs) as AsyncValidatorFn | null)
    //         : null
    //     )
    //     .filter(isPresent);
    // }
  }))
  .views((self) => ({
    get isUntouched() {
      return !self.isTouched;
    }
    // get validator(): ValidatorFn | null {
    //   const { Validators } = getEnv<typeof environment>(self);
    //   return Validators.compose(self.validatorFunctions, { strategy: self.validateStrategy });
    // },
    // get asyncValidator(): AsyncValidatorFn | null {
    //   const { Validators } = getEnv<typeof environment>(self);
    //   return Validators.composeAsync(self.asyncValidatorFunctions, {
    //     strategy: self.asyncValidateStrategy
    //   });
    // }
  }))
  .actions((self) => ({
    blur() {
      if (!self.__everBlured) {
        self.__everBlured = true;
      }
    },
    focus() {
      if (!self.__everFoucused) {
        self.__everFoucused = true;
      }
    }
  }));
