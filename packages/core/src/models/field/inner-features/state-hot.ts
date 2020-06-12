import { types } from 'mobx-state-tree';
import { observable } from 'mobx';

// ✨Feature - ✨HotState
export const FeatureHotState = types.model('✨HotState', {}).volatile(() => ({
  hotState: observable.object<{ [key: string]: any }>({})
}));
