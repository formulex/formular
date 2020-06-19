import { types } from 'mobx-state-tree';

// ✨Feature - ✨Disabled
export const FeatureDisabled = types
  .model('✨Disabled', {
    _disabled: types.maybe(types.boolean)
  })
  .actions((self) => ({
    setDisabled(disabled: boolean | undefined) {
      self._disabled = disabled;
    }
  }))
  .views((self) => ({
    get disabled(): boolean | undefined {
      return self._disabled;
    },
    set disabled(val: boolean | undefined) {
      self.setDisabled(val);
    }
  }));
