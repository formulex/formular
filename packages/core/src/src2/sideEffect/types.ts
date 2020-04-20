import { Resolvers } from './resolvers';

export interface Setup {
  (resolvers: Resolvers): void;
}
