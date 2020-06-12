import { types } from 'mobx-state-tree';

// ✨Feature - ✨FrozenState
export const FeatureFrozenState = types
  .model('✨FrozenState', {
    _frozenState: types.frozen()
  })
  .actions((self) => ({
    setFrozenState(val: any) {
      self._frozenState = val;
    }
  }))
  .views((self) => ({
    get frozenState() {
      return self._frozenState;
    },
    set frozenState(val: any) {
      self.setFrozenState(val);
    }
  }));
