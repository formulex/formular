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
  value: <T = any>(name: string) => T;
}

export function useResolvers({ base: root }: ResolversOptions): Resolvers {
  const resolver = useMemo(() => {
    return ((base: FieldGroupInstance) => (name: string) =>
      fieldResolver(base, name))(root);
  }, [root]);

  const value = useMemo(() => {
    return (name: string) => resolver(name)?.value;
  }, [resolver]);

  console.log('valueOf', typeof value);
  const resolvers = useAsObservableSource({
    field: resolver as Resolvers['field'],
    group: resolver as Resolvers['group'],
    array: resolver as Resolvers['array'],
    value: value as Resolvers['value']
  });
  console.log(resolvers);
  return resolvers;
}
