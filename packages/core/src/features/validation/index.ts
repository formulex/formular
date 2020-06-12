import type { FormFeature } from '../types';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import { addMiddleware, applyAction, IActionContext } from 'mobx-state-tree';
import Ajv from 'ajv';
import { TriggerEnumType } from '..';

const getDispatch = memoize((cacheKey: string, ms: number) =>
  debounce((call: IActionContext) => {
    applyAction(call.context.validation, {
      name: 'validate',
      args: []
    });
  }, ms)
);

export interface CreateValidationFeatureOptions {
  triggers?: Array<TriggerEnumType>;
  debounce?: number;
}

export function createValidationFeature({
  triggers = ['blur'],
  debounce = 16 * 6
}: CreateValidationFeatureOptions = {}): FormFeature {
  return (form) => {
    const unregisterMiddleware = addMiddleware(form, (call, next) => {
      switch (call.name) {
        case 'setValue':
          if (
            triggers.includes('change') &&
            typeof call.context.validation.validate === 'function'
          ) {
            getDispatch(`${call.context.name}:${call.name}`, debounce)(call);
          }
          break;
        case 'blur':
          if (
            triggers.includes('blur') &&
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
