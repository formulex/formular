import { types, cast } from 'mobx-state-tree';

// ✨Feature - ✨Enum
export const FeatureEnum = types
  .model('✨Enum', {
    _enum: types.maybe(types.array(types.frozen()))
  })
  .actions((self) => ({
    setEnum(val: any[] | undefined) {
      self._enum = cast(val);
    }
  }))
  .views((self) => ({
    get enum() {
      return self._enum;
    },
    set enum(val: any[] | undefined) {
      self.setEnum(val);
    }
  }));
