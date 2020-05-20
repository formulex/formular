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
import { observer } from 'mobx-react';

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
  useEffect(
    () =>
      runWithResolvers(form, ({ field, value }) =>
        autorun(() => {
          const val = value<string>('greeting');
          field('greetingSync')!.show = Boolean(
            val === undefined || val.length <= 5
          );
          field('greetingSync')!.setIgnored(
            Boolean(val === undefined || val.length <= 1)
          );
          field('greetingSync')!.setDisabled(true);
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
        editable={false}
        onFinish={(values) => {
          console.log('finish', values);
        }}
        onFinishFailed={(errors) => {
          console.log('errors', errors);
        }}
        subscribe={function* (_, form) {
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
          component={observer(({ $meta: { field }, ...rest }: any) => {
            if (field.editable === false) {
              return <span>{field.value}</span>;
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
          })}
        />
        <Field
          label="同步问候"
          name="greetingSync"
          component={observer(({ $meta: { field }, ...rest }: any) => {
            if (field.editable === false) {
              return <span>{field.value}</span>;
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
          })}
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
          // onClick={() => {
          //   form.validate({ abortEarly: true }).then((errors) => {
          //     if (!errors) {
          //       console.log(form, form.values);
          //     }
          //   });
          // }}
        >
          提交
        </Button>
        <Button htmlType="reset" style={{ marginLeft: '1rem' }}>
          重置
        </Button>
        <Button
          style={{ marginLeft: '1rem' }}
          onClick={() => {
            form.editable = !form.editable;
          }}
        >
          Toggle Editable
        </Button>
      </Form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
