import { types } from 'mobx-state-tree';

// ✨Feature - ✨Loading
export const FeatureLoading = types
  .model('✨Loading', {
    _loading: types.maybe(types.boolean)
  })
  .actions((self) => ({
    setLoading(loading: boolean | undefined) {
      self._loading = loading;
    }
  }))
  .views((self) => ({
    get loading() {
      return self._loading;
    },
    set loading(val: boolean | undefined) {
      self.setLoading(val);
    }
  }));
