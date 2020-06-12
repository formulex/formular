import { types } from 'mobx-state-tree';

// ✨Feature - ✨Show
export const FeatureShow = types
  .model('✨Show', {
    _show: types.boolean
  })
  .actions((self) => ({
    setShow(val: boolean) {
      self._show = val;
    }
  }))
  .views((self) => ({
    get show() {
      return self._show;
    },
    set show(val: boolean) {
      self.setShow(val);
    }
  }));
