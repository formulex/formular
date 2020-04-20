import memoize from 'lodash.memoize';
import debounce from 'lodash.debounce';
import { IActionContext, applyAction } from 'mobx-state-tree';

export const getDispatch = memoize(
  (cacheKey: string, ms: number, actionName: string) =>
    debounce((call: IActionContext) => {
      applyAction(call.context, { name: actionName, args: [] });
    }, ms)
);
