import { types, getParentOfType } from 'mobx-state-tree';
import { Form } from '../../form';

// ✨Feature - ✨Collection
export const FeatureCollection = types
  .model('✨Collection', {
    _ignored: types.boolean,
    _plain: types.maybe(types.boolean)
  })
  .actions((self) => ({
    setIgnored(ignored: boolean) {
      self._ignored = ignored;
    },
    setPlain(plain: boolean) {
      self._plain = plain;
    }
  }))
  .views((self) => ({
    get plain(): boolean {
      return self._plain ?? getParentOfType(self, Form).plain;
    },
    set plain(val: boolean) {
      self.setPlain(val);
    }
  }))
  .views((self) => ({
    get ignored(): boolean {
      return self._ignored || self.plain === true;
    },
    set ignored(val: boolean) {
      self.setIgnored(val);
    }
  }));
