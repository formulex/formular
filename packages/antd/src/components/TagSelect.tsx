import React from 'react';
import { mapFieldMetaToProps, useFieldEditable } from '../utils';
import { RenderComponentProps } from '../layout-components';
import { SelectProps } from 'antd/lib/select';
import { useRenderConfig } from '../contexts';
import { Typography, Select as AntdSelect } from 'antd';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const TagSelect: React.FC<RenderComponentProps<
  SelectProps<string | number>
>> = ({ $meta, mapPropsToShow, ...antdProps }) => {
  const renderConfig = useRenderConfig();
  const selectTexts: (string | number | boolean)[] = $meta.field.value || [];
  let result: undefined | string = undefined;
  if (
    !$meta.field.editable &&
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
    <AntdSelect {...antdProps} {...mapper($meta, antdProps)} mode="tags" />,
    <Typography.Text>
      {mapPropsToShow?.({ $meta, ...antdProps }) ||
        result ||
        ($meta.field.value || []).join(', ') ||
        renderConfig.emptyContent}
    </Typography.Text>
  );
};
