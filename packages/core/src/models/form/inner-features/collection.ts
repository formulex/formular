import { types } from 'mobx-state-tree';

// ✨Feature - ✨Collection
export const FeatureCollection = types
  .model('✨Collection', {
    _plain: types.boolean
  })
  .actions((self) => ({
    setPlain(plain: boolean) {
      self._plain = plain;
    }
  }))
  .views((self) => ({
    get plain(): boolean {
      return self._plain;
    },
    set plain(val: boolean) {
      self.setPlain(val);
    }
  }));
