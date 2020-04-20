import { FormInstance } from '../models/form';

export interface FormDecorator {
  (form: FormInstance): () => void;
}
