import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Typography, Checkbox as AntdCheckbox } from 'antd';
import { useRenderConfig } from '../contexts';
import { useFieldEditable, mapFieldMetaToProps } from '../utils';
import { CheckboxGroupProps } from 'antd/lib/checkbox';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const CheckboxGroup: React.FC<RenderComponentProps<
  CheckboxGroupProps
>> = ({ $meta, ...antdProps }) => {
  const renderConfig = useRenderConfig();
  const selectTexts: (string | number | boolean)[] = $meta.field.value || [];
  let result: undefined | string = undefined;
  if (
    $meta.field.plain &&
    Array.isArray(antdProps.options) &&
    antdProps.options.length >= 1
  ) {
    const first = antdProps.options[0];
    if (typeof first === 'string') {
      result = selectTexts.join(', ');
    } else if (typeof first.value === 'string' && first.label) {
      result = antdProps.options
        .filter(
          (el) => typeof el !== 'string' && selectTexts.includes(el.value)
        )
        .map((el) => (typeof el !== 'string' ? el.label : el))
        .join(', ');
    }
  }
  return useFieldEditable(
    $meta,
    <AntdCheckbox.Group {...antdProps} {...mapper($meta, antdProps)} />,
    <Typography.Text>{result || renderConfig.emptyContent}</Typography.Text>
  );
};
