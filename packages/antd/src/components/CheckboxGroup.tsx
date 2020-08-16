import React from 'react';
import AntdCheckboxGroup, { CheckboxGroupProps } from 'antd/lib/checkbox/Group';
import { asAtomField, shallowEqualComponentValue } from '@formular/react';

export const CheckboxGroup = asAtomField<CheckboxGroupProps>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled
    };
  },
  ({ field }, { finalEmptyContent }) => {
    let text: string | undefined = undefined;
    if (Array.isArray(field.value) && Array.isArray(field.enum)) {
      text = field.enum
        .filter(({ value }) => field.value.includes(value))
        .map(({ label }) => label)
        .join(', ');
    }
    return <span>{text ?? finalEmptyContent}</span>;
  },
  { retrieveValueFromEvent: (val) => val }
)(React.memo(AntdCheckboxGroup as any, shallowEqualComponentValue));
