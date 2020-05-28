import React from 'react';
import { mapFieldMetaToProps, useFieldEditable } from '../utils';
import { RenderComponentProps } from '../layout-components';
import { SelectProps } from 'antd/lib/select';
import { useRenderConfig } from '../contexts';
import { Typography, Select as AntdSelect } from 'antd';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const mapper = mapFieldMetaToProps({
  getValueFromEvent: (val) => val
});

export const Select: React.FC<RenderComponentProps<
  SelectProps<string | number>
>> = observer(({ $meta, mapPropsToShow, ...antdProps }) => {
  const renderConfig = useRenderConfig();
  let selectText: string = $meta.field.value;
  let options: any[] | undefined = antdProps.options ?? [
    ...($meta.field.enum ?? [])
  ];
  options = options.length ? options : undefined;
  const loading = antdProps.loading ?? $meta.field.loading;
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

  const onSearch = (val: any) => {
    runInAction('onSearch', () => {
      $meta.field.hotExtend.search = val;
    });

    if (typeof antdProps.onSearch === 'function') {
      antdProps.onSearch.call(null, val);
    }
  };

  return useFieldEditable(
    $meta,
    <AntdSelect
      {...antdProps}
      options={options}
      loading={loading}
      onSearch={onSearch}
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
});
