import React from 'react';
import { mapFieldMetaToProps, useFieldEditable } from '../utils';
import { RenderComponentProps } from '../layout-components';
import { SelectProps } from 'antd/lib/select';
import { useRenderConfig } from '../contexts';
import { Typography, Select as AntdSelect } from 'antd';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const Select: React.FC<RenderComponentProps<
  SelectProps<string | number>
>> = ({ $meta, mapPropsToShow, ...antdProps }) => {
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
    <AntdSelect
      {...antdProps}
      {...mapper($meta, antdProps)}
      mode={undefined}
    />,
    <Typography.Text>
      {mapPropsToShow?.({ $meta, ...antdProps }) ||
        selectText ||
        $meta.field.value ||
        renderConfig.emptyContent}
    </Typography.Text>
  );
};
