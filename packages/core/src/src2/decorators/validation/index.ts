import type { FormDecorator } from '../types';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import {
  IActionContext,
  applyAction,
  addMiddleware,
  destroy
} from 'mobx-state-tree';
import { isFieldInstance } from '../../models/field';
import { createFieldValidation } from './model';

const getDispatch = memoize(
  (cacheKey: string, ms: number, actionName: string) =>
    debounce((call: IActionContext) => {
      applyAction(call.context.extend.get('validation'), {
        name: actionName,
        args: []
      });
    }, ms)
);

export interface CreateValidationDecoratorProps {
  validateFunctionName?: string;
  trigger?: 'change' | 'blur';
  debounce?: number;
}

export function createValidationDecorator({
  validateFunctionName = 'validate',
  trigger = 'change',
  debounce = 100
}: CreateValidationDecoratorProps = {}): FormDecorator {
  return (form) => {
    const diposer = addMiddleware(form, (call, next) => {
      switch (call.name) {
        case 'didRegisterField':
          {
            const [fieldName] = call.args;
            const validation = createFieldValidation({ name: fieldName });
            const field = form.resolve(fieldName);
            if (field) {
              validation.setFieldRef(field);
              field.setExtend('validation', validation);
            }
          }
          break;
        case 'didUnregisterField':
          {
            const [fieldName] = call.args;
            const field = form.resolve(fieldName);
            if (field) {
              const validation = field.extend.get('validation');
              if (validation) {
                destroy(validation);
              }
              field.removeExtend('validation');
            }
          }
          break;
        case 'setValue':
          if (
            trigger === 'change' &&
            isFieldInstance(call.context) &&
            call.context.extend.get('validation') &&
            typeof call.context.extend.get('validation')[
              validateFunctionName
            ] === 'function'
          ) {
            getDispatch(
              `${call.context.name}:${call.name}`,
              debounce,
              validateFunctionName
            )(call);
          }
          break;
        case 'blur':
          if (
            trigger === 'blur' &&
            isFieldInstance(call.context) &&
            call.context.extend.get('validation') &&
            typeof call.context.extend.get('validation')[
              validateFunctionName
            ] === 'function'
          ) {
            getDispatch(
              `${call.context.name}:${call.name}`,
              0,
              validateFunctionName
            )(call);
          }
          break;
      }
      next(call);
    });
    return () => {
      diposer();
    };
  };
}
