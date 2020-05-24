import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { generalMapper } from './commons';
import { Typography } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable } from '../utils';
import TextArea, { TextAreaProps } from 'antd/es/input/TextArea';

export const InputArea: React.FC<RenderComponentProps<TextAreaProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <TextArea {...antdProps} {...generalMapper($meta, antdProps)} />,
    <Typography.Text>
      {$meta.field.value || renderConfig.emptyContent}
    </Typography.Text>
  );
};
