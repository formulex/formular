import { Resolvers } from './resolvers';
import { FormInstance } from '../models';

export interface Setup extends GeneratorFunction {
  (helps: Resolvers, form: FormInstance): Generator<
    undefined | (() => void),
    undefined | (() => void),
    void
  >;
}
