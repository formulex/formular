import { types } from 'mobx-state-tree';

// ✨Feature - ✨State Flags
export const FeatureStateFlags = types
  .model('✨StateFlags', {
    _everBlured: types.boolean,
    _everFocused: types.boolean,
    active: types.boolean,
    modified: types.boolean
  })
  .actions((self) => ({
    blur() {
      if (!self._everBlured) {
        self._everBlured = true;
      }
      if (self.active) {
        self.active = false;
      }
    },
    focus() {
      if (!self._everFocused) {
        self._everFocused = true;
      }
      if (!self.active) {
        self.active = true;
      }
    },
    resetFlags() {
      self._everBlured = false;
      self._everFocused = false;
      self.active = false;
      self.modified = false;
    }
  }))
  .views((self) => ({
    get touched(): boolean {
      return self._everBlured && self._everFocused;
    },
    get visited(): boolean {
      return self._everFocused;
    }
  }));
