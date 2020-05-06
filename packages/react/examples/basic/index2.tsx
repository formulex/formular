import { render } from 'react-dom';
import { Form, Item, useForm } from '../../src';
import React, { useEffect } from 'react';
import { Observer } from 'mobx-react';
import { autorun } from 'mobx';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { Button, Card, Form as AntdForm, Input, Rate } from 'antd';
import 'antd/dist/antd.css';
import { DisplayRender } from './DisplayRender';
import type { RateProps } from 'antd/lib/rate';
import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { addMiddleware } from 'mobx-state-tree';
import { configure } from '@formular/core';

configure({
  ajvLocalize: require('ajv-i18n/localize/zh')
});

const AntdRate = (Rate as any) as React.FC<RateProps & { [key: string]: any }>;

whyDidYouRender(React, {
  trackAllPureComponents: true,
  trackHooks: true
});

const validateMapper: { [key: string]: ValidateStatus } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  WARNING: 'warning'
};

const DynamicItems: React.FC<{ show: boolean }> = ({ show }) => {
  return !show ? (
    <div>None...</div>
  ) : (
    <>
      <Item name="stars2">
        {({ field }) => (
          <AntdForm.Item
            label="评分2"
            validateStatus={
              field.touched
                ? validateMapper[field.validation.status]
                : undefined
            }
            help={
              field.touched ? field.validation.messages.join(', ') : undefined
            }
          >
            <DisplayRender />
            <AntdRate
              onChange={(val) => field.setValue(val)}
              value={field.value}
              onFocus={() => field.focus()}
              onBlur={() => field.blur()}
            />
          </AntdForm.Item>
        )}
      </Item>
      <Item name="reason2">
        {({ field }) => (
          <AntdForm.Item
            style={{ display: field.show ? 'initial' : 'none' }}
            label="不给5星的理由2"
            validateStatus={
              field.touched
                ? validateMapper[field.validation.status]
                : undefined
            }
            help={
              field.touched ? field.validation.messages.join(', ') : undefined
            }
          >
            <DisplayRender />
            <Input
              onChange={(e) => field.setValue(e.target.value)}
              value={field.value}
              onFocus={() => field.focus()}
              onBlur={() => field.blur()}
            />
          </AntdForm.Item>
        )}
      </Item>
    </>
  );
};

const MyApp: React.FC = () => {
  const [form] = useForm();
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    (window as any).form = form;
  }, [form]);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>MyApp</h1>
      <Button onClick={() => setShow((_) => !_)}>
        {show ? '点击隐藏' : '点击显示'}
      </Button>
      <p>圆圈 ⭕️里的数字 = 该组件渲染次数</p>
      <DisplayRender />
      <Card>
        <Form
          form={form}
          initialValues={{ stars: 4 }}
          subscribe={function* ({ field, value }, form) {
            yield autorun(() => {
              let reason = field('reason');
              if (reason) {
                reason.show = value('stars') !== 5;
                if (!reason.show) {
                  reason.value = '';
                }
              }
            });

            yield addMiddleware(form, (call, next) => {
              switch (call.name) {
                case 'didRegisterField':
                  console.log('register field', call.args[0]);
                  break;
                case 'didUnregisterField':
                  console.log('unregister field', call.args[0]);
                  break;
              }
              next(call);
            });

            yield autorun(() => {
              // console.log(getSnapshot(form.fields));
              console.log(
                'stars',
                form.fields.get('stars')?.validation.validator?.(4)
              );
            });
          }}
        >
          <DisplayRender />
          <Item
            name="stars"
            rule={{
              minimum: 5,
              validator: (val: number) => {
                return val !== 2;
              },
              warningKeys: ['minimum', 'validator'],
              errorMessage: {
                validator: '不可以是2星',
                minimum: '至少是5星'
              }
            }}
            // asyncRule={{
            //   asyncValidator: async (val: number) => {
            //     console.log('async validator run', val);
            //     return val !== 1;
            //   },
            //   errorMessage: '不能为1星'
            // }}
          >
            {({ field }) => (
              <AntdForm.Item
                label="评分"
                validateStatus={
                  (field.touched && validateMapper[field.validation.status]) ||
                  undefined
                }
                help={field.touched && field.validation.messages.join(', ')}
              >
                <DisplayRender />
                <AntdRate
                  onChange={(val) => field.setValue(val)}
                  value={field.value}
                  onFocus={() => field.focus()}
                  onBlur={() => field.blur()}
                />
              </AntdForm.Item>
            )}
          </Item>
          <Item name="reason">
            {({ field }) => (
              <AntdForm.Item
                style={{ display: field.show ? 'initial' : 'none' }}
                label="不给5星的理由"
                validateStatus={
                  field.touched
                    ? validateMapper[field.validation.status]
                    : undefined
                }
                help={
                  field.touched
                    ? field.validation.messages.join(', ')
                    : undefined
                }
              >
                <DisplayRender />
                <Input
                  onChange={(e) => field.setValue(e.target.value)}
                  value={field.value}
                  onFocus={() => field.focus()}
                  onBlur={() => field.blur()}
                />
              </AntdForm.Item>
            )}
          </Item>
          <Observer>
            {() => (
              <div style={{ position: 'relative' }}>
                <pre>
                  <DisplayRender />
                  {JSON.stringify(form.values, null, 2)}
                </pre>
              </div>
            )}
          </Observer>
          <Observer>
            {() => (
              <div style={{ position: 'relative' }}>
                <pre>
                  <DisplayRender />
                  {JSON.stringify(form.initialValues, null, 2)}
                </pre>
              </div>
            )}
          </Observer>
          <DynamicItems show={show} />
        </Form>
      </Card>
    </div>
  );
};

render(<MyApp />, document.getElementById('app'));
