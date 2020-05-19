import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import version from 'antd/lib/version';
import Input from 'antd/lib/input';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Field, useForm, runWithResolvers } from '../../src';
import { autorun } from 'mobx';
import { addMiddleware } from 'mobx-state-tree';

const App: React.FC = () => {
  const [form] = useForm();
  useEffect(
    () =>
      runWithResolvers(form, ({ field, value }) =>
        autorun(() => {
          const val = value('greeting');
          field('greetingSync')!.value = val;
          // setTimeout(() => {
          //   field('greetingSync')!.value = val;
          // });
        })
      ),
    []
  );
  return (
    <div className="App">
      <h1>antd version: {version}</h1>
      <Form
        layout="vertical"
        form={form}
        onFinish={(values) => {
          console.log('finish', values);
        }}
        subscribe={function* ({ field, value }, form) {
          // yield autorun(() => {
          //   field('greetingSync')!.value = value('greeting');
          // });

          yield addMiddleware(form, (call, next) => {
            console.log(call.name, call.args, call.context?.name);
            if (call.name === 'blur') {
              console.log(call.context);
            }
            next(call);
          });
        }}
      >
        <Field
          label="问候"
          name="greeting"
          initialValue="daddy"
          addonAfter="world"
          component={({ $meta: { field } }) => {
            return (
              <Input
                onChange={(e) => field.setValue(e.target.value)}
                value={field.value}
                onFocus={() => field.focus()}
                onBlur={() => field.blur()}
              />
            );
          }}
        />
        <Field
          label="同步问候"
          name="greetingSync"
          component={({ $meta: { field }, ...rest }) => {
            return (
              <Input
                {...rest}
                onChange={(e) => field.setValue(e.target.value)}
                value={field.value}
                onFocus={() => field.focus()}
                onBlur={() => field.blur()}
              />
            );
          }}
          rule={{
            type: 'string',
            minLength: 3,
            errorMessage: '请至少输入3位文本'
          }}
          componentProps={{ addonAfter: 'hello', style: { width: '240px' } }}
          extra="This will sync with greeting..."
          addonAfter="hello"
        />
        <Button
          type="primary"
          htmlType="submit"
          onClick={() => {
            form.validate({ abortEarly: true }).then((errors) => {
              if (!errors) {
                console.log(form, form.values);
              }
            });
          }}
        >
          提交
        </Button>
        <Button
          htmlType="reset"
          style={{ marginLeft: '1rem' }}
          onClick={() => {
            console.log('reset', form);
            form.reset();
          }}
        >
          重置
        </Button>
      </Form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
