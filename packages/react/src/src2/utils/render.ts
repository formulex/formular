import React from 'react';

export interface RenderableProps<T> {
  component?: React.ComponentType<any>;
  children?: ((props: T) => React.ReactNode) | React.ReactNode;
  render?: (props: T) => React.ReactNode;
}

export function renderComponent<T>(
  { component, children, render }: RenderableProps<T>,
  props: T,
  name: string
): React.ReactNode {
  if (component) {
    return React.createElement(component, { ...props }, { children, render });
  }

  if (render) {
    return render(
      children === undefined ? { ...props } : { ...props, children }
    );
  }

  if (typeof children !== 'function') {
    throw new Error(
      `Must specify either a render prop, a render function as children, or a component prop to ${name}`
    );
  }

  return children({ ...props });
}
