import React from 'react';
import AntdSelect, { SelectProps } from 'antd/lib/select';
import { asAtomField } from '@formular/react';
import { changeValue } from '@formular/core';
import { isObservableArray } from 'mobx';

export const TagSelect = asAtomField<SelectProps<any>>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      mode: 'tags',
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
