import { types } from 'mobx-state-tree';

export const Field = types
  .model('Field', {
    value: types.maybe(types.union(types.string, types.number, types.boolean))
  })
  .actions(self => ({
    setValue(val?: string | number | boolean) {
      self.value = val === '' ? undefined : val;
    }
  }))
  .actions(self => ({
    patchValue(val?: string | number | boolean) {
      self.setValue(val);
    }
  }));
