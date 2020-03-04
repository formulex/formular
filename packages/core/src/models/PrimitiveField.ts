import { types } from 'mobx-state-tree';
import {
  VALID,
  INVALID,
  PENDING,
  DISABLED,
  PrimitiveType,
  AbstractFieldOptions,
  BaseAbstractFieldOptions,
  StatusEnumerationType
} from '../shared';
import { ValidationErrors } from '../validation/types';
import { FieldCore } from './FieldCore';

export const PrimitiveField = FieldCore.named('PrimitiveField')
  .props({
    value: types.maybeNull(types.frozen<PrimitiveType>())
  })
  .views(self => ({
    get isAllDisabled() {
      return self.isDisabled;
    }
  }))
  .actions(self => ({
    setValue(val: PrimitiveType | null) {
      self.value = val === '' ? undefined : val;
      if (self.isPristine) {
        self.isPristine = false;
      }
    },
    reset(initialValue: PrimitiveType | null = null, shouldRemainValidation: boolean = false) {
      self.value = initialValue;
      self.isPristine = true;
      self.__everBlured = false;
      self.__everFoucused = false;
    },
    runValidator(): ValidationErrors | null {
      return self.validator ? self.validator(self as any) : null;
    },
    async runAsyncValidator(): Promise<ValidationErrors | null> {
      if (self.asyncValidator) {
        self.status = PENDING;
        return self.asyncValidator(self as any);
      }
      return null;
    },
    calculateNextStatus(): StatusEnumerationType {
      if (self.isAllDisabled) return DISABLED;
      if (self.errors) return INVALID;
      return VALID;
    }
  }))
  .actions(self => ({
    patchValue(val: PrimitiveType | null) {
      self.setValue(val);
    },
    setErrorsAndUpdateStatus(errors: ValidationErrors | null): void {
      self.errors = errors;
      self.status = self.calculateNextStatus();
    }
  }))
  .actions(self => ({
    disable() {
      self.status = DISABLED;
      self.setErrorsAndUpdateStatus(null);
    },
    async runAllValidator(): Promise<void> {
      self.status = (self.isAllDisabled ? DISABLED : VALID) as StatusEnumerationType;
      if (self.isEnabled) {
        self.setErrorsAndUpdateStatus(self.runValidator());
        if (self.status === VALID || self.status === PENDING) {
          self.setErrorsAndUpdateStatus(await self.runAsyncValidator());
        }
      }
    }
  }))
  .actions(self => ({
    enable() {
      self.status = VALID;
      self.runAllValidator();
    }
  }));

export function createPrimitiveField(
  initialValue: PrimitiveType | null = null,
  validatorsOrOpts?: AbstractFieldOptions | string[],
  asyncValidators?: string[],
  options?: BaseAbstractFieldOptions
) {
  const computedValidators = Array.isArray(validatorsOrOpts)
    ? validatorsOrOpts
    : (validatorsOrOpts &&
        Array.isArray(validatorsOrOpts.validators) &&
        validatorsOrOpts.validators) ||
      [];
  const computedAsyncValidators = Array.isArray(asyncValidators)
    ? asyncValidators
    : (validatorsOrOpts &&
        !Array.isArray(validatorsOrOpts) &&
        Array.isArray(validatorsOrOpts.asyncValidators) &&
        validatorsOrOpts.asyncValidators) ||
      [];
  const { validateStrategy, asyncValidateStrategy, validateTrigger, disabled } =
    options || (!Array.isArray(validatorsOrOpts) && validatorsOrOpts) || {};
  const field = PrimitiveField.create({
    value: initialValue,
    validators: computedValidators,
    asyncValidators: computedAsyncValidators,
    validateTrigger: validateTrigger || 'change',
    validateStrategy: validateStrategy || 'all',
    asyncValidateStrategy: asyncValidateStrategy || 'parallel',
    status: VALID
  });
  if (disabled) {
    field.disable();
  }
  field.runAllValidator();
  return field;
}
