import AntdCheckbox, { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { asAtomField } from '@formular/react';

export const Checkbox = asAtomField<CheckboxProps>(undefined, {
  valuePropName: 'checked',
  mutateFromEvent(change, e) {
    change(e.target.checked);
  }
})(AntdCheckbox);
