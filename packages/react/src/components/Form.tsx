import React from 'react';
import { asFormContainer } from '../hoc';

export const Form = asFormContainer<
  React.FormHTMLAttributes<HTMLFormElement>
>()((props) => <form {...props} />);

Form.displayName = 'FormularForm';
