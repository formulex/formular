import AntdUpload, { UploadProps } from 'antd/lib/upload';
import { asAtomField } from '@formular/react';
import React from 'react';
import { shallowEqual } from '@formular/core';

export const Upload = asAtomField<UploadProps>(
  ({ field }, componentProps) => ({
    ...componentProps,
    disabled: field.plain || field.disabled,
    children: field.plain ? undefined : (componentProps as any)?.children
  }),
  {
    valuePropName: 'fileList',
    retrieveValueFromEvent: (e) => {
      if (Array.isArray(e)) {
        return e;
      }
      return e && e.fileList;
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
