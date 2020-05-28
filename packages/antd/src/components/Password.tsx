import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { generalMapper } from './commons';
import { Typography } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable } from '../utils';
import {
  default as AntdPassword,
  PasswordProps
} from 'antd/lib/input/Password';

export const Password: React.FC<RenderComponentProps<PasswordProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <AntdPassword {...antdProps} {...generalMapper($meta, antdProps)} />,
    <Typography.Text>
      {$meta.field.value || renderConfig.emptyContent}
    </Typography.Text>
  );
};
