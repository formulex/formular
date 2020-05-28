import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { default as AntdInput, InputProps } from 'antd/lib/input/Input';
import { generalMapper } from './commons';
import { Typography } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable } from '../utils';

export const Input: React.FC<RenderComponentProps<InputProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <AntdInput {...antdProps} {...generalMapper($meta, antdProps)} />,
    <Typography.Text>
      {$meta.field.value || renderConfig.emptyContent}
    </Typography.Text>
  );
};
