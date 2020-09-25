import { Resolvers } from './resolvers';
import { FormInstance, FieldInstance } from '../models';

export interface SubscribeArgs extends Resolvers {
  form: FormInstance;
}

export interface BaseSubscription {
  unsubscribe: () => void;
}

export type Cancelable = (() => void) | BaseSubscription;

export interface SubscribeSetup<Args> {
  (args: Args):
    | Generator<undefined | Cancelable, void | Cancelable, void>
    | (() => void)
    | void;
}

export interface PatternSubscribeSetup {
  (field: FieldInstance, tokens: RegExpExecArray): Generator<
    undefined | Cancelable,
    void | Cancelable,
    void
  >;
}

export interface PatternGroupSetup {
  (
    fields: FieldInstance[],
    fullArray: Array<{ field: FieldInstance; tokens: RegExpExecArray }>
  ): void;
}
