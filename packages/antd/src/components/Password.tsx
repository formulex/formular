import AntdPassword, { PasswordProps } from 'antd/lib/input/Password';
import { asAtomField } from '@formular/react';

export const Password = asAtomField<PasswordProps>()(AntdPassword);
