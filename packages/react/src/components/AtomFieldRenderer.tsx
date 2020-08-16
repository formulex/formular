import React from 'react';
import { useRegistryContext } from '../hook/useRegistryContext';
import type { AtomFieldComponentProps, Source } from './asAtomField';
import { invariant } from '@formular/core';

export interface AtomFieldRendererProps<CP extends Record<string, any>>
  extends AtomFieldComponentProps<{}> {
  component: string | React.ComponentType<AtomFieldComponentProps<CP>>;
  componentProps?: CP | ((source: Source) => CP);
}

export function AtomFieldRenderer<CP extends Record<string, any>>({
  component,
  componentProps,
  $source
}: AtomFieldRendererProps<CP>): React.ReactElement {
  const registry = useRegistryContext('<AtomFieldRenderer>');
  let Component = component;
  if (registry && typeof component === 'string' && registry.fields[component]) {
    Component = registry.fields[component];
  }
  invariant(
    typeof Component !== 'string',
    `Cannot find component "${component}". Do you register it correctly?`
  );

  // return (
  //   <Observer>
  //     {() => {
  //       const props = {
  //         ...(typeof componentProps === 'function'
  //           ? (componentProps as (source: Source) => CP)($source)
  //           : componentProps),
  //         $source
  //       } as AtomFieldComponentProps<CP>;
  //       return <Component {...props} />;
  //     }}
  //   </Observer>
  // );

  const props = {
    ...componentProps,
    $source
  } as AtomFieldComponentProps<CP>;
  return <Component {...props} />;
}
