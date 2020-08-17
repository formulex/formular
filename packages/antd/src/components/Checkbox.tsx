import AntdCheckbox, { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { asAtomField } from '@formular/react';
import React from 'react';

export const Checkbox = asAtomField<CheckboxProps>(
  undefined,
  (__, { finalEmptyContent }, componentProps) => {
    return <span>{componentProps.children ?? finalEmptyContent}</span>;
  },
  {
    valuePropName: 'checked',
    mutateFromEvent(change, e) {
      change(e.target.checked);
    }
  }
)(AntdCheckbox);
