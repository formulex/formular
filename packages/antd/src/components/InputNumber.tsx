import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Typography, InputNumber as AntdInputNumber } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable, mapFieldMetaToProps } from '../utils';
import { InputNumberProps } from 'antd/lib/input-number';

const inputNumberMapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const InputNumber: React.FC<RenderComponentProps<InputNumberProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <AntdInputNumber {...antdProps} {...inputNumberMapper($meta, antdProps)} />,
    <Typography.Text>
      {$meta.field.value || renderConfig.emptyContent}
    </Typography.Text>
  );
};
