import React from 'react';
import { createForm, shallowEqual } from '@formular/core';
import type {
  FormInstance,
  FormConfig,
  OnFinish,
  OnFinishFailed
} from '@formular/core';
import { useConstant, useWhenValueChanges } from '../use';
import { FormInstanceContext } from '../context/FormInstanceContext';

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
    form.setPlain(Boolean(plain));
  });

  useWhenValueChanges(perishable, () => {
    form.setPerishable(Boolean(perishable));
  });

  useWhenValueChanges(
    initialValues,
    () => {
      form.initialize(initialValues);
    },
    shallowEqual
  );

  useWhenValueChanges(
    messageVariables,
    () => {
      form.setMessageVariables(messageVariables);
    },
    shallowEqual
  );

  useWhenValueChanges(
    validateMessages,
    () => {
      form.setValidateMessages(validateMessages);
    },
    shallowEqual
  );

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
    <FormInstanceContext.Provider value={form}>
      <>
        {isRenderFunction(children)
          ? children({ form, handleSubmit })
          : children}
      </>
    </FormInstanceContext.Provider>
  );
};

Formular.displayName = 'Formular';
