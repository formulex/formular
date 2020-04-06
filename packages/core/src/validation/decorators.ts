import { ValidationErrors } from './types';

export function anError(
  o: Omit<ValidationErrors, '$$typeof'>
): Omit<ValidationErrors, '$$typeof'> & { $$typeof: 'error' } {
  return {
    ...o,
    $$typeof: 'error'
  };
}

export function aWarning(
  o: Omit<ValidationErrors, '$$typeof'>
): Omit<ValidationErrors, '$$typeof'> & { $$typeof: 'warning' } {
  return {
    ...o,
    $$typeof: 'warning'
  };
}
