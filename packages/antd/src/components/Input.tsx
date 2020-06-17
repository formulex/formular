import AntdInput, { InputProps } from 'antd/lib/input/Input';
import { connect } from '@formular/react';

export const Input = connect<InputProps>({ renderTextContent: true })(
  AntdInput
);
