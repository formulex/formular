import AntdInputNumber, { InputNumberProps } from 'antd/lib/input-number';
import { connect } from '@formular/react';

export const InputNumber = connect<InputNumberProps>({
  getValueFromEvent(val) {
    return val;
  },
  renderTextContent: true
})(AntdInputNumber);
