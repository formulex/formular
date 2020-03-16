import { useScopeContext } from '../contexts/scope';
import { useEffect, useMemo } from 'react';
import { autorun } from 'mobx';
import { FieldGroupInstance } from '@formular/core';
import { ResolverContextManager, ResolverContext } from '../utils';

export interface AutorunsOptions {
  scope?: FieldGroupInstance;
}

export interface AutorunEffect {
  (): void;
}

export function useAutoruns(
  autoruns?: AutorunEffect | AutorunEffect[],
  { scope: outterScope }: AutorunsOptions = {}
) {
  let scopeCtx = useScopeContext();
  if (typeof outterScope === 'object' && outterScope !== null) {
    scopeCtx = outterScope;
  }
  const effects = useMemo(() => {
    const fns = Array.isArray(autoruns)
      ? autoruns
      : typeof autoruns === 'function'
      ? [autoruns]
      : void 0;
    return fns;
  }, [autoruns]);

  effects?.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new Error(
        `Autorun effect should be a function, but got ${fn} with type ${typeof fn}`
      );
    }
  });

  useEffect(() => {
    const disposers = effects?.map(effect =>
      autorun(
        () => {
          ResolverContextManager.push(new ResolverContext(scopeCtx));
          effect();
          ResolverContextManager.pop();
        },
        {
          name: `FormularAutorunWithTheseFieldNames:(${Object.keys(
            scopeCtx.value
          ).join('|')})`
        }
      )
    );
    return () => {
      disposers?.forEach(f => f());
    };
  }, [effects, scopeCtx]);
}
