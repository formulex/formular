import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Typography, Checkbox as AntdCheckbox } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable, mapFieldMetaToProps } from '../utils';
import { CheckboxProps } from 'antd/lib/checkbox';

const mapper = mapFieldMetaToProps({
  valuePropName: 'checked',
  getValueFromEvent: (e) => e.target.checked
});

export const Checkbox: React.FC<RenderComponentProps<CheckboxProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  return useFieldEditable(
    $meta,
    <AntdCheckbox {...antdProps} {...mapper($meta, antdProps)} />,
    <Typography.Text>
      {antdProps.children || renderConfig.emptyContent}
    </Typography.Text>
  );
};
