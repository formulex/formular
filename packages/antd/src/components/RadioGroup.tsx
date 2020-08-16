import React from 'react';
import AntdRadioGroup from 'antd/lib/radio/group';
import { asAtomField } from '@formular/react';
import type { RadioGroupProps } from 'antd/lib/radio';

export const RadioGroup = asAtomField<RadioGroupProps>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled
    };
  },
  ({ field }, { finalEmptyContent }) => {
    let text: string | undefined = undefined;
    if (Array.isArray(field.enum)) {
      text = field.enum
        .filter(({ value }) => field.value === value)
        .map(({ label }) => label)
        .pop();
    }
    return <span>{text ?? finalEmptyContent}</span>;
  },
  undefined
)(AntdRadioGroup);
