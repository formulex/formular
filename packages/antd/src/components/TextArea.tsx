import AntdTextArea, { TextAreaProps } from 'antd/lib/input/TextArea';
import { connect } from '@formular/react';

export const TextArea = connect<TextAreaProps>({ renderTextContent: true })(
  AntdTextArea
);
