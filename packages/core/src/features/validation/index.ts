import type { FormFeature } from '../types';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import { addMiddleware, applyAction, IActionContext } from 'mobx-state-tree';
export type { Rule, AsyncRule, FieldValidationConfig } from './types';
import Ajv from 'ajv';

const getDispatch = memoize((cacheKey: string, ms: number) =>
  debounce((call: IActionContext) => {
    applyAction(call.context.validation, {
      name: 'validate',
      args: []
    });
  }, ms)
);

export interface CreateValidationFeatureOptions {
  trigger?: 'change' | 'blur' | 'none';
  debounce?: number;
}

export function createValidationFeature({
  trigger = 'change',
  debounce = 16 * 6
}: CreateValidationFeatureOptions = {}): FormFeature {
  return (form) => {
    const unregisterMiddleware = addMiddleware(form, (call, next) => {
      switch (call.name) {
        case 'setValue':
          if (
            trigger === 'change' &&
            typeof call.context.validation.validate === 'function'
          ) {
            getDispatch(`${call.context.name}:${call.name}`, debounce)(call);
          }
          break;
        case 'blur':
          if (
            trigger === 'blur' &&
            typeof call.context.validation.validate === 'function'
          ) {
            getDispatch(`${call.context.name}:${call.name}`, 0)(call);
          }
          break;
      }
      next(call);
    });

    return () => {
      unregisterMiddleware();
      getDispatch.cache.clear?.();
    };
  };
}

export function createAjv() {
  return new Ajv({ allErrors: true, jsonPointers: true });
}