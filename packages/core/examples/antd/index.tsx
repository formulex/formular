import { render } from 'react-dom';
import React from 'react';
import 'antd/dist/antd.css';
import Simple from './simple';

const App = () => (
  <div>
    <Simple />
  </div>
);

render(<App />, document.getElementById('app'));
