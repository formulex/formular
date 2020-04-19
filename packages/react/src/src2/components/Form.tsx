import React, { useImperativeHandle } from 'react';
import { FormInstance } from '@formular/core/lib/src2/models/form';
import { useForm } from '../hooks';
import { renderComponent, RenderableProps } from '../utils';
import { FieldContext } from '../contexts';

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
>;

export interface FormProps
  extends BaseFormProps,
    RenderableProps<{ form: FormInstance }> {
  form?: FormInstance;
}

export const Form = React.forwardRef<FormInstance, FormProps>(
  ({ form, children, render, component, ...restProps }, ref) => {
    const [formInstance] = useForm(form);
    useImperativeHandle(ref, () => formInstance);
    return (
      <form
        {...restProps}
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          event.stopPropagation();
          // fixme: submit
          formInstance;
        }}
      >
        <FieldContext.Provider value={formInstance}>
          {renderComponent(
            { children, component, render },
            { form: formInstance },
            'FormularForm'
          )}
        </FieldContext.Provider>
      </form>
    );
  }
);

Form.displayName = 'FormularForm';
