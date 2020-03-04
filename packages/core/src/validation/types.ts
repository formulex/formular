import { AbstractField } from '../shared';

export interface ValidationErrors {
  [key: string]: any;
}

export interface ValidatorFn {
  (field: AbstractField): ValidationErrors | null;
}

export interface ValidatorFnFactory {
  (...args: any[]): ValidatorFn;
}

export interface AsyncValidatorFn {
  (field: AbstractField): Promise<ValidationErrors | null>;
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
export type AsyncValidateStrategy = 'parallel' | 'parallelBail' | 'series' | 'seriesBail';
