import React from 'react';
import { PlainConfigContext } from '../context/PlainConfigContext';

export function usePlainConfig(componentName?: string) {
  const form = React.useContext(PlainConfigContext);
  if (!form) {
    throw new Error(
      `${
        componentName ?? 'usePlainConfig'
      } must be used inside of a <Formular> component`
    );
  }
  return form;
}
