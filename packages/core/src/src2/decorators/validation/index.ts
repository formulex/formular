import type { FormDecorator } from '../types';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import {
  IActionContext,
  applyAction,
  addMiddleware,
  getPath
} from 'mobx-state-tree';

const getDispatch = memoize(
  (cacheKey: string, ms: number, actionName: string) =>
    debounce((call: IActionContext) => {
      applyAction(call.context, { name: actionName, args: [] });
    }, ms)
);

export interface CreateValidationDecoratorProps {
  validateFunctionName?: string;
}

export function createValidationDecorator({
  validateFunctionName = 'validate'
}: CreateValidationDecoratorProps = {}): FormDecorator {
  return (form) => {
    const diposer = addMiddleware(form, (call, next) => {
      if (
        call.name === 'setValue' &&
        typeof call.context[validateFunctionName] === 'function'
      ) {
        getDispatch(
          `${call.name}${getPath(call.context)}`,
          100,
          validateFunctionName
        )(call);
      }
      next(call);
    });
    return () => {
      diposer();
    };
  };
}
