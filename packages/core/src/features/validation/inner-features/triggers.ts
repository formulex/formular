import { types, cast } from 'mobx-state-tree';
import { TriggerEnumType } from '../types';

// ✨Feature - ✨Triggers
export const FeatureTriggers = types
  .model('✨Triggers', {
    _triggers: types.maybe(
      types.array(types.union(types.literal('change'), types.literal('blur')))
    ),
    _debounce: types.maybe(types.number)
  })
  .actions((self) => ({
    setTriggers(triggers: Array<TriggerEnumType> | undefined) {
      self._triggers = cast(triggers);
    },
    setDebounce(debounce: number | undefined) {
      self._debounce = debounce;
    }
  }))
  .views((self) => ({
    get triggers() {
      return self._triggers;
    },
    set triggers(triggers: Array<TriggerEnumType> | undefined) {
      self.setTriggers(triggers);
    },
    get debounce() {
      return self._debounce;
    },
    set debounce(time: number | undefined) {
      self.setDebounce(time);
    }
  }));
