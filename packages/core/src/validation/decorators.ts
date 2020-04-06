import { ValidationErrors } from './types';

export function withErrorType(
  o: Omit<ValidationErrors, '$$typeof'>
): Omit<ValidationErrors, '$$typeof'> & { $$typeof: 'error' } {
  return {
    ...o,
    $$typeof: 'error'
  };
}

export function withWarningType(
  o: Omit<ValidationErrors, '$$typeof'>
): Omit<ValidationErrors, '$$typeof'> & { $$typeof: 'warning' } {
  return {
    ...o,
    $$typeof: 'warning'
  };
}
