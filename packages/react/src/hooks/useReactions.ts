import { useFormContext } from '../contexts/form';
import { useResolvers, Resolvers } from './useResolvers';
import { useScopeContext } from '../contexts/scope';
import { useEffect, useMemo } from 'react';
import { reaction } from 'mobx';
import { FieldGroupInstance } from '@formular/core';

export interface ReactionsOptions {
  scope?: FieldGroupInstance;
  fireImmediately?: boolean;
}

export interface ReactionTrace {
  (resolvers: Resolvers): void;
}

export interface ReactionEffect {
  (...args: any[]): void;
}

export function useReactions(
  reactions?:
    | [ReactionTrace, ReactionEffect]
    | [ReactionTrace, ReactionEffect][],
  { scope: outterScope, fireImmediately }: ReactionsOptions = {}
) {
  let scopeCtx = useScopeContext();
  if (typeof outterScope === 'object' && outterScope !== null) {
    scopeCtx = outterScope;
  }
  const resolvers = useResolvers({ base: scopeCtx });
  const effects = useMemo(() => {
    let fns = Array.isArray(reactions) ? reactions : void 0;
    if (!fns) {
      return fns;
    }
    if (typeof fns[0] === 'function' && typeof fns[1] === 'function') {
      fns = [fns as [ReactionTrace, ReactionEffect]];
    }
    return (fns as [ReactionTrace, ReactionEffect][]).map(([f, g]) => [
      () => f(resolvers),
      g
    ]);
  }, [reactions, resolvers]);

  effects?.forEach(([f, g]) => {
    if (typeof f !== 'function' || typeof g !== 'function') {
      throw new Error(
        `Reaction effect should be a function, but got ${[f, g]}.`
      );
    }
  });

  useEffect(() => {
    const disposers = effects?.map(([f, g]) =>
      reaction(f, g, {
        name: `FormularReactionWithTheseFieldNames:(${Object.keys(
          scopeCtx.value
        ).join('|')})`,
        fireImmediately
      })
    );
    return () => {
      disposers?.forEach(f => f());
    };
  }, [effects, scopeCtx, resolvers, fireImmediately]);
}
