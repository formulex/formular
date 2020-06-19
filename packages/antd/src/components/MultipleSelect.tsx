import React from 'react';
import AntdSelect, { SelectProps } from 'antd/lib/select';
import { connect } from '@formular/react';

export const MultipleSelect = connect<SelectProps<any>>({
  getValueFromEvent: (val) => val,
  renderTextContent({
    meta: { field },
    renderConfig: { emptyContent, PreviewComponent = 'span' }
  }) {
    let text: string | undefined = undefined;
    if (Array.isArray(field.value) && Array.isArray(field.enum)) {
      text = field.enum
        .filter(({ value }) => field.value.includes(value))
        .map(({ label }) => label)
        .join(', ');
    }
    return <PreviewComponent>{text ?? emptyContent}</PreviewComponent>;
  },
  getDerivedPropsFromFieldMeta({ componentProps, meta: { field } }) {
    return {
      ...componentProps,
      mode: 'multiple',
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled,
      loading: field.loading ?? componentProps.loading
    };
  }
})(AntdSelect);
