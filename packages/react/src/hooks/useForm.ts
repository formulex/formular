import { CreateFormOptions, FormInstance, createForm } from '@formular/core';
import { useMemo, useEffect } from 'react';
import {
  addMiddleware,
  applyAction,
  getPath,
  IActionContext
} from 'mobx-state-tree';
import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';

export interface FormOptions<Values> extends CreateFormOptions<Values> {}

const getDispatch = memoize((cacheKey: string, ms: number = 100) =>
  debounce((call: IActionContext) => {
    applyAction(call.context, { name: 'validate', args: [] });
  }, ms)
);

let f: any = null;
export function useForm<Values = any>(
  options: FormOptions<Values> = {},
  previousForm?: FormInstance
): [FormInstance] {
  const form = useMemo(() => {
    return previousForm || createForm(options);
  }, []);

  // useEffect(() => {
  //   if (!previousForm) {
  //     form.root.patchValue(options.values || {});
  //   }
  // }, [options.values, form, previousForm]);

  useEffect(() => {
    if (!previousForm) {
      form.root.patchInitialValue(options.initialValues || {});
    }
  }, [options.initialValues, form, previousForm]);

  useEffect(() => {
    if (!f) {
      const diposer = addMiddleware(form, (call, next) => {
        console.log(call);
        if (
          call.name === 'setValue' &&
          typeof call.context.validate === 'function'
        ) {
          const dispatchValidate = getDispatch(
            `${form.uid}:${call.name}${getPath(call.context)}`
          );
          dispatchValidate(call);
        }
        next(call);
      });
      f = form;
      return diposer;
    }
    return;
  }, [form]);

  return [form];
}
