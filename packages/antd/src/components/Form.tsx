import React from 'react';
import { Form as AntDesignForm } from 'antd';
// fixme: use "import type" after prettier 2.0
import { FormProps as AntDesignFormProps } from 'antd/lib/form/Form';
import { Container as InnerContainer } from '@formular/react';
import { ContainerProps as InnerContainerProps } from '@formular/react/lib/components/Container';
import { FormInstance } from '@formular/core';

export interface FormProps
  extends Omit<AntDesignFormProps, 'form' | 'component'>,
    Omit<InnerContainerProps, 'children'> {}

export const Form: React.FC<FormProps> = React.forwardRef(
  ({ children, form, auto, watch, ref: rawRaf, ...antdProps }, ref) => {
    return (
      <InnerContainer ref={ref as any} form={form} auto={auto} watch={watch}>
        {(formInstance: FormInstance) => (
          <AntDesignForm
            {...antdProps}
            onReset={() => formInstance.reset()}
            component={(props) => (
              <form
                {...props}
                onSubmit={() => formInstance.submit()}
                onReset={() => formInstance.reset()}
              />
            )}
          >
            {children}
          </AntDesignForm>
        )}
      </InnerContainer>
    );
  }
);
