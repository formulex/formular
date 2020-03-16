import { useScopeContext } from '../contexts/scope';
import { useEffect, useMemo } from 'react';
import { reaction, IReactionPublic } from 'mobx';
import { FieldGroupInstance } from '@formular/core';
import { ResolverContextManager, ResolverContext } from '../utils';

export interface ReactionsOptions {
  scope?: FieldGroupInstance;
  fireImmediately?: boolean;
}

export interface ReactionTrace {
  (r: IReactionPublic): any;
}

export interface ReactionEffect {
  (data: any, r: IReactionPublic): void;
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
  const effects = useMemo(() => {
    let fns = Array.isArray(reactions) ? reactions : void 0;
    if (!fns) {
      return fns;
    }
    if (typeof fns[0] === 'function' && typeof fns[1] === 'function') {
      fns = [fns as [ReactionTrace, ReactionEffect]];
    }
    return fns as [ReactionTrace, ReactionEffect][];
  }, [reactions]);

  effects?.forEach(([f, g]) => {
    if (typeof f !== 'function' || typeof g !== 'function') {
      throw new Error(
        `Reaction effect should be a function, but got ${[f, g]}.`
      );
    }
  });

  useEffect(() => {
    const disposers = effects?.map(([f, g]) =>
      reaction(
        r => {
          ResolverContextManager.push(new ResolverContext(scopeCtx));
          const result = f(r);
          ResolverContextManager.pop();
          return result;
        },
        (arg, r) => {
          ResolverContextManager.push(new ResolverContext(scopeCtx));
          const result = g(arg, r);
          ResolverContextManager.pop();
          return result;
        },
        {
          name: `FormularReactionWithTheseFieldNames:(${Object.keys(
            scopeCtx.value
          ).join('|')})`,
          fireImmediately
        }
      )
    );
    return () => {
      disposers?.forEach(f => f());
    };
  }, [effects, scopeCtx, fireImmediately]);
}
