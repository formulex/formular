import AntdUpload, { UploadProps } from 'antd/lib/upload';
import { asAtomField } from '@formular/react';
import React from 'react';
import { shallowEqual } from '@formular/core';
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
      change((value) => {
        if (isObservableArray(value)) {
          value.replace(array);
        }
      });
    }
  }
)(
  React.memo(
    AntdUpload,
    ({ fileList: aValue, ...aRest }, { fileList: bValue, ...bRest }) => {
      return (
        aValue?.map((e) => e.uid).join('-') ===
          bValue?.map((e) => e.uid).join('-') && shallowEqual(aRest, bRest)
      );
    }
  )
);
