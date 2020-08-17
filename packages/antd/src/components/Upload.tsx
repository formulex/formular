import AntdUpload, { UploadProps } from 'antd/lib/upload';
import { asAtomField } from '@formular/react';
import React from 'react';
import { shallowEqual, changeValue } from '@formular/core';
import { isObservableArray } from 'mobx';

export const Upload = asAtomField<UploadProps>(
  ({ field }, componentProps) => ({
    ...componentProps,
    disabled: field.plain || field.disabled,
    children: field.plain ? undefined : (componentProps as any)?.children
  }),
  {
    valuePropName: 'fileList',
    mutateFromEvent(change, e) {
      const array = Array.isArray(e) ? e : e && e.fileList;
      change((value, values, name) => {
        if (isObservableArray(value)) {
          value.replace(array);
        } else if (value === undefined && Array.isArray(array)) {
          changeValue(values, name, array);
        }
      });
    }
  }
)(AntdUpload);
