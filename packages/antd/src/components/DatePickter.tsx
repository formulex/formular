import AntdDatePicker, { DatePickerProps } from 'antd/lib/date-picker';
import { connect } from '@formular/react';
import moment from 'moment';
import React from 'react';

export const DatePicker = connect<DatePickerProps>({
  getValueFromEvent(val) {
    return val?.format() ?? val?.toString();
  },
  getValueProps(valStr) {
    return valStr && moment(valStr);
  },
  renderTextContent({
    meta: { field },
    renderConfig: { emptyContent, PreviewComponent = 'span' },
    componentProps: { format = 'YYYY-MM-DD HH:mm:ss' }
  }) {
    const formatStr = Array.isArray(format) ? format[0] : format;
    return (
      <PreviewComponent>
        {(field.value && moment(field.value).format(formatStr)) ?? emptyContent}
      </PreviewComponent>
    );
  }
})(AntdDatePicker);
