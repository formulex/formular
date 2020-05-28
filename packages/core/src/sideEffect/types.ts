import { Resolvers } from './resolvers';
import { FormInstance, FieldInstance } from '../models';

export interface SubscribeSetup {
  (helps: Resolvers, form: FormInstance): Generator<
    undefined | (() => void),
    void | (() => void),
    void
  >;
}

export interface PatternSubscribeSetup {
  (field: FieldInstance, tokens: RegExpExecArray): Generator<
    undefined | (() => void),
    void | (() => void),
    void
  >;
}

export interface PatternGroupSetup {
  (
    fields: FieldInstance[],
    fullArray: Array<{ field: FieldInstance; tokens: RegExpExecArray }>
  ): void;
}
