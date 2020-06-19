import AntdUpload, { UploadProps } from 'antd/lib/upload';
import { connect } from '@formular/react';

export const Upload = connect<UploadProps>({
  valuePropName: 'fileList',
  getValueFromEvent: (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  },
  getDerivedPropsFromFieldMeta: ({ componentProps, meta: { field } }) => ({
    ...componentProps,
    disabled: field.plain || field.disabled,
    children: field.plain ? undefined : (componentProps as any)?.children
  })
})(AntdUpload);
