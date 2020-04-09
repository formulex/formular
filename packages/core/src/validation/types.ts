import type {
  FieldInstance,
  FieldGroupInstance,
  FieldArrayInstance
} from '../nodes';

export type ValidationFieldType =
  | FieldInstance
  | FieldGroupInstance
  | FieldArrayInstance;

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

export type Rule = string | any[] | ValidatorFn;
export type AsyncRule = string | any[] | AsyncValidatorFn;
