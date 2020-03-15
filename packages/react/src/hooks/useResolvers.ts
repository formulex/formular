import {
  FieldGroupInstance,
  fieldResolver,
  FieldInstance,
  FieldArrayInstance
} from '@formular/core';
import { useMemo } from 'react';
import { useAsObservableSource } from 'mobx-react';

export interface ResolversOptions {
  base: FieldGroupInstance;
}

export interface Resolvers {
  field: (name: string) => FieldInstance;
  group: (name?: string) => FieldGroupInstance;
  array: (name?: string) => FieldArrayInstance;
}

export function useResolvers({ base: root }: ResolversOptions): Resolvers {
  const resolver = useMemo(() => {
    return ((base: FieldGroupInstance) => (name: string) =>
      fieldResolver(base, name))(root);
  }, [root]);
  const resolvers = useAsObservableSource({
    field: resolver as Resolvers['field'],
    group: resolver as Resolvers['group'],
    array: resolver as Resolvers['array']
  });
  return resolvers;
}
