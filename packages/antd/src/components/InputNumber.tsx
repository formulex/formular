import AntdInputNumber, { InputNumberProps } from 'antd/lib/input-number';
import { asAtomField } from '@formular/react';

export const InputNumber = asAtomField<InputNumberProps>(undefined, {
  mutateFromEvent(change, val) {
    change(val);
  }
})(AntdInputNumber);
