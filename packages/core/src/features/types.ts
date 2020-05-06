import { FormInstance } from '../models';

export interface FormFeature {
  (form: FormInstance): () => void;
}
