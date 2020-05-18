import { createContext, Context } from 'react';
import React from 'react';
import { Registry } from '../registry';

export const RegistryContext: Context<Registry | null> = createContext<Registry | null>(
  null
);

export const useRegistryContext: () => Registry = () => {
  const registry = React.useContext(RegistryContext);
  if (!registry) {
    throw new Error('Cannot find an inner registry.');
  }
  return registry;
};
