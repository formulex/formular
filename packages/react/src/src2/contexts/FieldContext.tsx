import { createContext, Context } from 'react';
import { FormInstance } from '@formular/core/lib/src2/models/form';
import React from 'react';

export const FieldContext: Context<FormInstance | null> = createContext<FormInstance | null>(
  null
);

export const useFieldContext: () => FormInstance = () => {
  const form = React.useContext(FieldContext);
  if (!form) {
    throw new Error('Cannot find an inner form instance.');
  }
  return form;
};
