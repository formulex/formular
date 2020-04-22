import { render } from 'react-dom';
import { Form, Item, useForm } from '../../src';
import React, { useEffect } from 'react';
import { Observer } from 'mobx-react';
import { autorun } from 'mobx';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { Rate, Form as AntdForm, Input, Card } from 'antd';
import 'antd/dist/antd.css';
import { DisplayRender } from './DisplayRender';
import type { RateProps } from 'antd/lib/rate';
import type { ValidateStatus } from 'antd/lib/form/FormItem';

const AntdRate = (Rate as any) as React.FC<RateProps & { [key: string]: any }>;

whyDidYouRender(React, {
  trackAllPureComponents: true,
  trackHooks: true
});

const validateMapper: { [key: string]: ValidateStatus } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error'
};

const MyApp: React.FC = () => {
  const [form] = useForm();

  useEffect(() => {
    (window as any).form = form;
  }, [form]);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>MyApp</h1>
      <p>圆圈 ⭕️里的数字 = 该组件渲染次数</p>
      <DisplayRender />
      <Card>
        <Form
          form={form}
          initialValues={{ stars: 4 }}
          subscribe={function* ({ field, value }) {
            yield autorun(() => {
              let reason = field('reason');
              if (reason) {
                reason.show = value('stars') !== 5;
                if (!reason.show) {
                  reason.value = '';
                }
              }
            });
          }}
        >
          <DisplayRender />
          <Item name="stars">
            {({ field }) => (
              <AntdForm.Item
                label="评分"
                validateStatus={
                  field.touched
                    ? validateMapper[field.extend.get('validation').status]
                    : undefined
                }
                help={
                  field.touched
                    ? field.extend.get('validation').messages.join(', ')
                    : undefined
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
          <Item name="reason">
            {({ field }) => (
              <AntdForm.Item
                style={{ display: field.show ? 'initial' : 'none' }}
                label="不给5星的理由"
                validateStatus={
                  field.touched
                    ? validateMapper[field.extend.get('validation').status]
                    : undefined
                }
                help={
                  field.touched
                    ? field.extend.get('validation').messages.join(', ')
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
                  {console.log(form.toJSON())}
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
        </Form>
      </Card>
    </div>
  );
};

render(<MyApp />, document.getElementById('app'));
