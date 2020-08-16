import AntdInput, { InputProps } from 'antd/lib/input/Input';
import { asAtomField } from '@formular/react';

export const Input = asAtomField<InputProps>()(AntdInput);
