import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Upload as AntdUpload } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable, mapFieldMetaToProps } from '../utils';
import type { UploadProps } from 'antd/lib/upload/interface';

const mapper = mapFieldMetaToProps({
  valuePropName: 'fileList',
  getValueFromEvent: (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
});

export const Upload: React.FC<RenderComponentProps<UploadProps>> = ({
  $meta,
  mapPropsToShow,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <AntdUpload {...antdProps} {...mapper($meta, antdProps)} />,
    mapPropsToShow?.({ $meta, ...antdProps }) || (
        <AntdUpload
          {...antdProps}
          {...mapper($meta, antdProps)}
          disabled={true}
        />
      ) ||
      renderConfig.emptyContent
  );
};
