import {
  // ValidatorFn,
  // AsyncValidatorFn,
  ValidateTriggers,
  ValidateStrategy,
  AsyncValidateStrategy
} from './validation/types';
import { Instance } from 'mobx-state-tree';
import { PrimitiveField } from './models/PrimitiveField';

/**
 * Field Status
 */
export const VALID: 'VALID' = 'VALID';
export const INVALID: 'INVALID' = 'INVALID';
export const PENDING: 'PENDING' = 'PENDING';
export const DISABLED: 'DISABLED' = 'DISABLED';
export type StatusEnumerationType =
  | typeof VALID
  | typeof INVALID
  | typeof PENDING
  | typeof DISABLED;

export type PrimitiveType = string | number | boolean | undefined;
export type AbstractField = Instance<typeof PrimitiveField>;

export interface BaseAbstractFieldOptions {
  validateTrigger?: ValidateTriggers;
  validateStrategy?: ValidateStrategy;
  asyncValidateStrategy?: AsyncValidateStrategy;
  disabled?: boolean;
}

export interface AbstractFieldOptions extends BaseAbstractFieldOptions {
  validators?: string[] | null;
  asyncValidators?: string[] | null;
}
