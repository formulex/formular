import type { FormFeature } from '../types';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import { addMiddleware, applyAction, IActionContext } from 'mobx-state-tree';
import { isFieldInstance } from '../../models';
export type { Rule, AsyncRule, FieldValidationConfig } from './types';

const getDispatch = memoize((cacheKey: string, ms: number) =>
  debounce((call: IActionContext) => {
    applyAction(call.context.validation, {
      name: 'validate',
      args: []
    });
  }, ms)
);

export interface CreateValidationFeatureOptions {
  trigger?: 'change' | 'blur';
  debounce?: number;
}

export function createValidationFeature({
  trigger = 'change',
  debounce = 100
}: CreateValidationFeatureOptions = {}): FormFeature {
  return (form) =>
    addMiddleware(form, (call, next) => {
      switch (call.name) {
        case 'setValue':
          if (
            trigger === 'change' &&
            isFieldInstance(call.context) &&
            typeof call.context.validation.validate === 'function'
          ) {
            getDispatch(`${call.context.name}:${call.name}`, debounce)(call);
          }
          break;
        case 'blur':
          if (
            trigger === 'blur' &&
            isFieldInstance(call.context) &&
            typeof call.context.validation.validate === 'function'
          ) {
            getDispatch(`${call.context.name}:${call.name}`, 0)(call);
          }
          break;
      }
      next(call);
    });
}
