import React, { useImperativeHandle } from 'react';
import { FormInstance } from '@formular/core/lib/src2/models/form';
import { useForm, useSetup, useDecorators } from '../hooks';
import { renderComponent, RenderableProps } from '../utils';
import { FieldContext } from '../contexts';
import { SubscribeSetup } from '@formular/core/lib/src2/sideEffect';
import { FormDecorator } from '@formular/core/lib/src2/decorators/types';

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
>;

export interface FormProps
  extends BaseFormProps,
    RenderableProps<{ form: FormInstance }> {
  form?: FormInstance;
  subscribe?: SubscribeSetup;
  decorators?: FormDecorator[];
}

export const Form = React.forwardRef<FormInstance, FormProps>(
  (
    { form, children, render, component, subscribe, decorators, ...restProps },
    ref
  ) => {
    const [formInstance] = useForm(form);
    useImperativeHandle(ref, () => formInstance);
    useSetup(formInstance, subscribe);
    useDecorators(formInstance, decorators);
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
(Form as any).whyDidYouRender = true;
