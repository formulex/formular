import React from 'react';
import { FormInstanceContext } from '../context/FormInstanceContext';

export function useFormInstance(componentName?: string) {
  const form = React.useContext(FormInstanceContext);
  if (!form) {
    throw new Error(
      `${
        componentName ?? 'useFormInstance'
      } must be used inside of a <Formular> component`
    );
  }
  return form;
}
