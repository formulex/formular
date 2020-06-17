import React from 'react';
import AntdRadioGroup from 'antd/lib/radio/group';
import { connect } from '@formular/react';
import { RadioGroupProps } from 'antd/lib/radio';

export const RadioGroup = connect<RadioGroupProps>({
  renderTextContent({
    meta: { field },
    renderConfig: { emptyContent, PreviewComponent = 'span' }
  }) {
    let text: string | undefined = undefined;
    if (Array.isArray(field.enum)) {
      text = field.enum
        .filter(({ value }) => field.value === value)
        .map(({ label }) => label)
        .pop();
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
})(AntdRadioGroup);
