import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import DatePicker from 'antd/lib/date-picker';
import version from 'antd/lib/version';
import Input from 'antd/lib/input';
import 'antd/dist/antd.css';
import './index.css';
import { Form, FormItem, field, value } from '../../src';
import { decorate } from '@formular/react';

const FInput = decorate()(Input);

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>antd version: {version}</h1>
      <DatePicker />
      <Button type="primary" style={{ marginLeft: 8 }}>
        Primary Button
      </Button>
      <Form
        autoRuns={() => {
          field('greetingSync').setValue(value('greeting'));
        }}
      >
        <FormItem name="greeting" initialValue="daddy" component={FInput} />
        <FormItem
          name="greetingSync"
          component={FInput}
          extra="This will sync with greeting..."
        />
      </Form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
