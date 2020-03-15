import { useFormContext } from '../contexts/form';
import { useResolvers, Resolvers } from './useResolvers';
import { useScopeContext } from '../contexts/scope';
import { useEffect, useMemo } from 'react';
import { autorun, reaction } from 'mobx';
import { FieldGroupInstance } from '@formular/core';

export interface AutorunsOptions {
  scope?: FieldGroupInstance;
}

export interface AutorunEffect {
  (resolvers: Resolvers): void;
}

export function useAutoruns(
  autoruns?: AutorunEffect | AutorunEffect[],
  { scope: outterScope }: AutorunsOptions = {}
) {
  let scopeCtx = useScopeContext();
  if (typeof outterScope === 'object' && outterScope !== null) {
    scopeCtx = outterScope;
  }
  const resolvers = useResolvers({ base: scopeCtx });
  const effects = useMemo(() => {
    const fns = Array.isArray(autoruns)
      ? autoruns
      : typeof autoruns === 'function'
      ? [autoruns]
      : void 0;
    return fns?.map(f => () => f(resolvers));
  }, [autoruns, resolvers]);

  effects?.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new Error(
        `Autorun effect should be a function, but got ${fn} with type ${typeof fn}`
      );
    }
  });

  useEffect(() => {
    const disposers = effects?.map(effect =>
      autorun(effect, {
        name: `FormularAutorunWithTheseFieldNames:(${Object.keys(
          scopeCtx.value
        ).join('|')})`
      })
    );
    return () => {
      disposers?.forEach(f => f());
    };
  }, [effects, scopeCtx, resolvers]);
}