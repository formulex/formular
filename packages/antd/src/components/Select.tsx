import React from 'react';
import { mapFieldMetaToProps, useFieldEditable } from '../utils';
import { RenderComponentProps } from '../layout-components';
import { SelectProps } from 'antd/lib/select';
import { useRenderConfig } from '../contexts';
import { Typography, Select as AntdSelect } from 'antd';
import { useObserver } from 'mobx-react';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const Select: React.FC<RenderComponentProps<
  SelectProps<string | number>
>> = ({ $meta, mapPropsToShow, ...antdProps }) => {
  const renderConfig = useRenderConfig();
  let selectText: string = $meta.field.value;
  const options = useObserver(
    () => antdProps.options ?? [...($meta.field.enum ?? [])]
  );
  const loading = useObserver(() => antdProps.loading ?? $meta.field.loading);
  if (!$meta.field.editable && Array.isArray(options)) {
    const target = options.find((el) => {
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
      options={options}
      loading={loading}
      {...mapper($meta, antdProps)}
      mode={undefined}
    />,
    <Typography.Text>
      {mapPropsToShow?.({ $meta, ...antdProps, options, loading }) ||
        selectText ||
        $meta.field.value ||
        renderConfig.emptyContent}
    </Typography.Text>
  );
};
