import generate, { PickerProps } from 'antd/lib/date-picker/generatePicker';
import { asAtomField } from '@formular/react';
import React from 'react';
import config from 'rc-picker/lib/generate/moment';
import moment from 'moment';

export const DatePicker = asAtomField<PickerProps<moment.Moment>>(
  undefined,
  ({ field }, { finalEmptyContent }, { format = 'YYYY-MM-DD HH:mm:ss' }) => {
    const formatStr = Array.isArray(format) ? format[0] : format;
    return (
      <span>
        {(field.value && moment(field.value)?.format(formatStr)) ??
          finalEmptyContent}
      </span>
    );
  },
  {
    retrieveValueFromEvent(val) {
      return val?.format() ?? val?.toString();
    },
    getValueProps(valStr) {
      return valStr && moment(valStr);
    }
  }
)(generate<moment.Moment>(config));
