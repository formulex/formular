import React from 'react';
import AntdCheckboxGroup, { CheckboxGroupProps } from 'antd/lib/checkbox/Group';
import { asAtomField, shallowEqualComponentValue } from '@formular/react';
import { isObservableArray } from 'mobx';
import { changeValue } from '@formular/core';

export const CheckboxGroup = asAtomField<CheckboxGroupProps>(
  ({ field }, componentProps) => {
    return {
      ...componentProps,
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled
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
)(AntdCheckboxGroup);
