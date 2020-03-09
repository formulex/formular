import { createContext, Context } from 'react';
import { FormInstance } from '@formular/core';
import React from 'react';

export const FormContext: Context<FormInstance | null> = createContext<FormInstance | null>(
  null
);

export const useFormContext: () => FormInstance = () => {
  const store = React.useContext(FormContext);
  if (!store) {
    throw new Error('useFormContext must be used within a StoreProvider.');
  }
  return store;
};
