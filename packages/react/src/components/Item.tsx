import React from 'react';
import { useField, CreateFieldOptions, FieldMeta } from '../hooks/useField';
import { useObserver } from 'mobx-react';
import { Rule, AsyncRule } from '@formular/core';

export interface ItemProps extends CreateFieldOptions {
  children?: (fieldMeta: FieldMeta) => React.ReactNode;
  rules?: Rule[];
  asyncRules?: AsyncRule[];
}

export const Item: React.FC<ItemProps> = ({
  name,
  initialValue,
  rules,
  asyncRules,
  children
}) => {
  const [fieldInstace] = useField({ name, initialValue, rules, asyncRules });

  const render = typeof children === 'function' && children;
  if (typeof render !== 'function') {
    throw new Error('children should be a function.');
  }

  return useObserver<any>(() => render(fieldInstace));
};

Item.displayName = 'Item';
