import React from 'react';
import { useField, CreateFieldOptions, FieldMeta } from '../hooks/useField';
import { useObserver } from 'mobx-react';

export interface ItemProps extends CreateFieldOptions {
  children?: (fieldMeta: FieldMeta) => React.ReactNode;
}

export const Item: React.FC<ItemProps> = ({ name, initialValue, children }) => {
  const fieldInstace = useField({ name, initialValue });

  const render = typeof children === 'function' && children;
  if (typeof render !== 'function') {
    throw new Error('children should be a function.');
  }

  return useObserver<any>(() => render(fieldInstace));
};
