import React from 'react';
import { RegistryContext } from '../context/RegistryContext';

export function useRegistryContext(componentName?: string) {
  const form = React.useContext(RegistryContext);
  if (!form) {
    throw new Error(
      `${
        componentName ?? 'useRegistryContext'
      } must be used inside of a <Formular> component`
    );
  }
  return form;
}
