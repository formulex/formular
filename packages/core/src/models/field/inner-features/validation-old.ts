import { types } from 'mobx-state-tree';
import { Validation } from '../../../features/validation/model';

// ✨Feature - ✨Validation
export const FeatureValidation = types.model('✨Validation', {
  validation: Validation
});
