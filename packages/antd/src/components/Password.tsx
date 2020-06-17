import AntdPassword, { PasswordProps } from 'antd/lib/input/Password';
import { connect } from '@formular/react';

export const Password = connect<PasswordProps>()(AntdPassword);
