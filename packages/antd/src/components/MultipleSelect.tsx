import React from 'react';
import AntdSelect, { SelectProps } from 'antd/lib/select';
import { asAtomField, shallowEqualComponentValue } from '@formular/react';
import { isObservableArray } from 'mobx';

export const MultipleSelect = asAtomField<SelectProps<any>>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      mode: 'multiple',
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled,
      loading: field.loading ?? componentProps.loading
    };
  },
  ({ field }, { finalEmptyContent }) => {
    let textArray: string[] = [];
    if (Array.isArray(field.value) && Array.isArray(field.enum)) {
      textArray = [...field.enum]
        .filter(({ value }) => field.value.includes(value))
        .map(({ label }) => label);
    }
    return (
      <span>{textArray.length ? textArray.join(', ') : finalEmptyContent}</span>
    );
  },
  {
    mutateFromEvent(change, array) {
      change((value) => {
        if (isObservableArray(value)) {
          value.replace(array);
        }
      });
    }
  }
)(React.memo(AntdSelect, shallowEqualComponentValue));
