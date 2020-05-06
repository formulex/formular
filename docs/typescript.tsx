/**
 * title: 源代码类型转换
 * desc: 如果我们的 demo 是采用 `TSX` 编写的，在展开源代码后，点击一旁的语言切换按钮，可切换显示成 JSX 的代码 123123
 */

import React from 'react';
import { Button } from 'antd';

interface BaseProps {}

const App: React.FC<BaseProps> = () => {
  return <Button type="primary">我是 antd 的按钮</Button>;
};

export default App;
