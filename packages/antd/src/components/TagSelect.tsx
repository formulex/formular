import React from 'react';
import AntdSelect, { SelectProps } from 'antd/lib/select';
import { asAtomField, shallowEqualComponentValue } from '@formular/react';

export const TagSelect = asAtomField<SelectProps<any>>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      mode: 'tags',
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled,
      loading: field.loading ?? componentProps.loading
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
)(React.memo(AntdSelect, shallowEqualComponentValue));
