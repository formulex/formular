import React from 'react';
import { connect, remainOwnEventHandler } from '@formular/react';
import AntdSelect, { SelectProps } from 'antd/lib/select';

export const Select = connect<SelectProps<string | number>>({
  getValueFromEvent: (val) => val,
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
  getDerivedPropsFromFieldMeta({ meta: { field }, componentProps }) {
    const computedProps = {
      onSearch: remainOwnEventHandler(componentProps.onSearch, (val: any) => {
        field.hotState.search = val;
      })
    };
    if (!componentProps.showSearch) {
      delete computedProps.onSearch;
    }
    return {
      ...componentProps,
      ...computedProps,
      mode: undefined,
      options: field.enum,
      disabled: field.disabled ?? componentProps.disabled,
      loading: field.loading ?? componentProps.loading
    };
  }
})(AntdSelect);
