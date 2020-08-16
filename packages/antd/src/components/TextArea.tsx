import AntdTextArea, { TextAreaProps } from 'antd/lib/input/TextArea';
import { asAtomField } from '@formular/react';

export const TextArea = asAtomField<TextAreaProps>()(AntdTextArea);
