import type { FieldInstance } from '../nodes';

export type ValidationFieldType = FieldInstance;
// only support Field
// | FieldGroupInstance
// | FieldArrayInstance;

export interface ValidationErrors {
  $$typeof?: 'error' | 'warning' | 'results';
  [key: string]: any;
}

export interface ValidatorFn {
  (field: ValidationFieldType): ValidationErrors | null;
}

export interface ValidatorFnFactory {
  (...args: any[]): ValidatorFn;
}

export interface AsyncValidatorFn {
  (field: ValidationFieldType): Promise<ValidationErrors | null>;
}

export interface AsyncValidatorFnFactory {
  (...args: any[]): AsyncValidatorFn;
}

export type ValidatorOrValidatorFactory =
  | ValidatorFn
  | AsyncValidatorFn
  | ValidatorFnFactory
  | AsyncValidatorFnFactory;

export type ValidateTriggers = 'change' | 'blur';
export type ValidateStrategy = 'all' | 'bail';
export type AsyncValidateStrategy =
  | 'parallel'
  | 'parallelBail'
  | 'series'
  | 'seriesBail';

export interface Rule {
  required?: boolean;
  max?: number;
  min?: number;
  format?: 'email';
  validator?: ValidatorFn;
  message?: string;
}

export interface AsyncRule {
  validator?: AsyncValidatorFn;
  message?: string;
}
