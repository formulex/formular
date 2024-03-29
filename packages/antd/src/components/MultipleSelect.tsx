import React from 'react';
import AntdSelect, { SelectProps } from 'antd/lib/select';
import { asAtomField } from '@formular/react';
import { isObservableArray } from 'mobx';
import { changeValue } from '@formular/core';

export const MultipleSelect = asAtomField<SelectProps<any>>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      mode: 'multiple',
      options: Array.isArray(field.enum) ? [...field.enum] : field.enum,
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
      change((value, values, name) => {
        if (isObservableArray(value)) {
          value.replace(array);
        } else if (value === undefined && Array.isArray(array)) {
          changeValue(values, name, array);
        }
      });
    }
  }
)(AntdSelect);
