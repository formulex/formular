import React from 'react';
import AntdCheckboxGroup, { CheckboxGroupProps } from 'antd/lib/checkbox/Group';
import { connect } from '@formular/react';

export const CheckboxGroup = connect<CheckboxGroupProps>({
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
      options: field.enum,
      disabled: field.disabled,
      loading: field.loading
    };
  }
})(AntdCheckboxGroup);
