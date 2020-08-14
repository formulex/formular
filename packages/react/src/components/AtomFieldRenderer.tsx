import React from 'react';
import { useRegistryContext } from '../hook/useRegistryContext';
import { AtomFieldComponentProps } from './asAtomField';
import { invariant } from '@formular/core';

export interface AtomFieldRendererProps<CP extends Record<string, any>>
  extends AtomFieldComponentProps<{}> {
  component: string | React.ComponentType<AtomFieldComponentProps<CP>>;
  componentProps?: CP;
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

  const props = {
    ...componentProps,
    $source
  } as AtomFieldComponentProps<CP>;
  return <Component {...props} />;
}
