import { connect, remainOwnEventHandler } from '@formular/react';
import Select, { SelectProps } from 'antd/lib/select';

export const XSelect = connect<SelectProps<string | number>>({
  getValueFromEvent: (val) => val,
  renderTextContent({ field }) {
    if (Array.isArray(field.enum)) {
      const targetOption = field.enum.find(
        ({ label, value }) => typeof label === 'string' && value === field.value
      );
      if (targetOption) {
        return targetOption.label;
      }
    }
    return field.value;
  },
  getDerivedPropsFromFieldMeta(componentProps, { field }) {
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
      options: field.enum
    };
  }
})(Select);
