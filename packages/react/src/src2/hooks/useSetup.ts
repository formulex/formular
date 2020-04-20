import { FormInstance } from '@formular/core/lib/src2/models/form';
import { useEffect } from 'react';
import { ResolverContextManager, Resolvers, getResolvers } from '../utils';
import { IReactionDisposer } from 'mobx';

export interface Setup {
  (resolvers: Resolvers): void;
}

export function useSetup(form: FormInstance, setup?: Setup) {
  useEffect(() => {
    const disposers: IReactionDisposer[] = [];
    if (typeof setup === 'function') {
      ResolverContextManager.push({ disposers });
      setup(getResolvers(form));
      ResolverContextManager.pop();
    }
    return () => {
      console.log('begin setup dispose');
      for (const disposer of disposers) {
        disposer();
      }
    };
  }, [form, setup]);
}
