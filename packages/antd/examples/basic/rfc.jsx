import React from 'react';

export const Demo = () => {
  return (
    <Form>
      <FormItem
        validate={[
          'required',
          ['max', 3],
          field => {
            return field.value === '123'
              ? {
                  is123: true
                }
              : null;
          }
        ]}
        asyncValidate={[async field => null]}
      />
    </Form>
  );
};
