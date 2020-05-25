import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Typography, Radio as AntdRadio } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable, mapFieldMetaToProps } from '../utils';
import { RadioGroupProps } from 'antd/lib/radio';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (e) => e.target.value
});

export const RadioGroup: React.FC<RenderComponentProps<RadioGroupProps>> = ({
  $meta,
  ...antdProps
}) => {
  const renderConfig = useRenderConfig();
  let selectText: string = $meta.field.value;
  if (!$meta.field.editable && Array.isArray(antdProps.options)) {
    const target = antdProps.options.find((el) => {
      if (typeof el === 'string') {
        return el === selectText;
      } else if (typeof el.value === 'string') {
        return el.value === selectText;
      }
    });

    if (target) {
      if (typeof target === 'string') {
        selectText = target;
      } else {
        selectText = target.label || target.value || $meta.field.value;
      }
    }
  }
  return useFieldEditable(
    $meta,
    <AntdRadio.Group {...antdProps} {...mapper($meta, antdProps)} />,
    <Typography.Text>{selectText || renderConfig.emptyContent}</Typography.Text>
  );
};
