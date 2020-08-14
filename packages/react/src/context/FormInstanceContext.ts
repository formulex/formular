import React from 'react';
import type { FormInstance } from '@formular/core';

export const FormInstanceContext = React.createContext<FormInstance | null>(
  null
);
