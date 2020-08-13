import React from 'react';
import { createForm } from '@formular/core';
import type {
  FormInstance,
  FormConfig,
  OnFinish,
  OnFinishFailed
} from '@formular/core';
import { useConstant, useWhenValueChanges } from '../use';

export interface FormularRenderProps {
  form: FormInstance;
  handleSubmit: React.FormEventHandler<any>;
}

export interface RenderChildren {
  (renderProps: FormularRenderProps): React.ReactNode;
}

export interface FormularProps<V> extends FormConfig<V> {
  form?: FormInstance;
  children?: React.ReactNode | RenderChildren;
  onFinish?: OnFinish;
  onFinishFailed?: OnFinishFailed;
}

function isRenderFunction(children: any): children is RenderChildren {
  return typeof children === 'function';
}

export const FormularContext = React.createContext<FormInstance | null>(null);

export const Formular: React.FC<FormularProps<any>> = ({
  form: alternateFormInstance,
  perishable,
  initialValues,
  children,
  onFinish,
  onFinishFailed,
  plain,
  messageVariables,
  validateMessages
}) => {
  const form = useConstant(
    () =>
      alternateFormInstance ??
      createForm({
        perishable,
        initialValues,
        plain,
        messageVariables,
        validateMessages
      })
  );

  useWhenValueChanges(plain, () => {
    if (plain !== undefined) {
      console.log('set plain', plain);
      form.setPlain(plain);
    }
  });

  const handleSubmit: React.FormEventHandler<any> = (event) => {
    if (event) {
      // sometimes not true, e.g. React Native
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      if (typeof event.stopPropagation === 'function') {
        // prevent any outer forms from receiving the event too
        event.stopPropagation();
      }
    }
    return form.submit(onFinish, onFinishFailed);
  };

  return (
    <FormularContext.Provider value={form}>
      <>
        {isRenderFunction(children)
          ? children({ form, handleSubmit })
          : children}
      </>
    </FormularContext.Provider>
  );
};

Formular.displayName = 'Formular';
