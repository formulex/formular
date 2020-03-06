import { createContext, Context } from 'react';
import { FormInstance } from '@formular/core';

export const FormContext: Context<FormInstance | null> = createContext<FormInstance | null>(
  null
);
