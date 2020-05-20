import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Field, useForm, Registry } from '../../src';
import { reaction } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { Card } from 'antd';

Registry.registerGlobalFields({
  Input: observer(({ $meta: { field }, emptyContent, ...rest }: any) => {
    if (field.editable === false) {
      return <span>{field.value || emptyContent}</span>;
    }
    return (
      <Input
        {...rest}
        disabled={field.disabled}
        onChange={(e) => field.setValue(e.target.value)}
        value={field.value}
        onFocus={() => field.focus()}
        onBlur={() => field.blur()}
      />
    );
  })
});

const App: React.FC = () => {
  const [form] = useForm();
  return (
    <Form
      layout="vertical"
      className="App"
      form={form}
      onFinish={(values) => {
        console.log('finish', values);
      }}
      onFinishFailed={(errors) => {
        console.log('errors', errors);
      }}
      subscribe={function* ({ field, value }) {
        yield reaction(
          () => value('greeting'),
          async (greetingValue) => {
            await new Promise((r) => setTimeout(r, 1000));
            field('greetingAsync')!.value = greetingValue;
          }
        );
      }}
    >
      <Field
        label="问候"
        name="greeting"
        initialValue="hello!"
        component="Input"
        editable={true}
      />
      <Field
        label="异步的问候"
        name="greetingAsync"
        component="Input"
        rule={{
          type: 'string',
          minLength: 5,
          errorMessage: 'The length is at least 5'
        }}
        componentProps={{
          style: { width: '240px' },
          emptyContent: 'Empty Tips'
        }}
      />
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
      <Button htmlType="reset" style={{ marginLeft: '1rem' }}>
        Reset
      </Button>
      <Button
        style={{ marginLeft: '1rem' }}
        onClick={() => {
          form.editable = !form.editable;
        }}
      >
        Toggle Editable
      </Button>
      <Card style={{ marginTop: '1rem' }}>
        <Observer>
          {() => <pre>{JSON.stringify(form.values, null, 2)}</pre>}
        </Observer>
      </Card>
    </Form>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
