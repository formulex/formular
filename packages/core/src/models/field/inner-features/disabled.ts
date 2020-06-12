import { types } from 'mobx-state-tree';

// ✨Feature - ✨Disabled
export const FeatureDisabled = types
  .model('✨Disabled', {
    _disabled: types.boolean
  })
  .actions((self) => ({
    setDisabled(disabled: boolean) {
      self._disabled = disabled;
    }
  }))
  .views((self) => ({
    get disabled(): boolean {
      return self._disabled;
    },
    set disabled(val: boolean) {
      self.setDisabled(val);
    }
  }));
