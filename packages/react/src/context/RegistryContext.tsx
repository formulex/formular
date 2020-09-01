import { createContext, Context } from 'react';
import { Registry } from '../registry';

export const RegistryContext: Context<Registry | null> = createContext<Registry | null>(
  null
);
