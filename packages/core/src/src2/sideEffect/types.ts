import { Resolvers } from './resolvers';
import { FormInstance } from '../models';

export interface SubscribeSetup {
  (helps: Resolvers, form: FormInstance): Generator<
    undefined | (() => void),
    void | (() => void),
    void
  >;
}
