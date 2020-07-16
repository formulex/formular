import { types } from 'mobx-state-tree';

// ✨Feature - ✨Perishable
export const FeaturePerishable = types
  .model('✨Perishable', {
    _perishable: types.boolean
  })
  .actions((self) => ({
    setPerishable(val: boolean) {
      self._perishable = val;
    }
  }))
  .views((self) => ({
    get perishable() {
      return self._perishable;
    },
    set perishable(val: boolean) {
      self.setPerishable(val);
    }
  }));
