import { createContext, Context } from 'react';
import { FieldGroupInstance } from '@formular/core';
import React from 'react';

export const ScopeConext: Context<FieldGroupInstance | null> = createContext<FieldGroupInstance | null>(
  null
);

export const useScopeContext: () => FieldGroupInstance = () => {
  const store = React.useContext(ScopeConext);
  if (!store) {
    throw new Error('Cannot find an scoped field group instance.');
  }
  return store;
};
