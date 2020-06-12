import { render } from 'react-dom';
import { Form, Item, useForm } from '../../src';
import React, { useEffect, useState } from 'react';
import { Observer } from 'mobx-react';
import { autorun } from 'mobx';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import {
  Button,
  Card,
  Form as AntdForm,
  Input,
  Rate,
  InputNumber,
  Select
} from 'antd';
import 'antd/dist/antd.css';
import { DisplayRender } from './DisplayRender';
import type { RateProps } from 'antd/lib/rate';
import { configure, TriggerEnumType } from '@formular/core';
import { addMiddleware } from 'mobx-state-tree';

configure({
  ajvLocalize: require('ajv-i18n/localize/zh')
});

const AntdRate = (Rate as any) as React.FC<RateProps & { [key: string]: any }>;

whyDidYouRender(React, {
  trackAllPureComponents: true,
  trackHooks: true
});

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  WARNING: 'warning',
  IGNORED: 'default'
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
  const [triggers, setTriggers] = useState<TriggerEnumType[]>([]);
  const [debounceTime, setDebounceTime] = useState(16);

  useEffect(() => {
    (window as any).form = form;
  }, [form]);

  // useSetup(form, function* () {
  //   yield addMiddleware(form, (call, next) => {
  //     console.log(
  //       call.name,
  //       call.context?.field?.name ?? call.context?.name,
  //       call.args

  //       // JSON.stringify(call.args, null, 2),
  //       // JSON.stringify(call.context, null, 2)
  //     );
  //     next(call);
  //   });
  // });
  return (
    <div style={{ padding: '1rem' }}>
      <h1>MyApp</h1>
      <Button onClick={() => setShow((_) => !_)}>
        {show ? '点击隐藏' : '点击显示'}
      </Button>
      <Select
        style={{ width: '240px' }}
        value={triggers}
        onChange={(val) => {
          setTriggers(val);
        }}
        mode="multiple"
        options={[
          { value: 'change', label: 'change' },
          { value: 'blur', label: 'blur' }
        ]}
      />
      <InputNumber
        value={debounceTime}
        onChange={(e) => setDebounceTime(e || (0 as any))}
      />
      <p>圆圈 ⭕️里的数字 = 该组件渲染次数</p>
      <DisplayRender />
      <Card>
        <Form
          onFinish={(values) => {
            console.log('Finished', values);
          }}
          formComponent={AntdForm}
          formComponentProps={{
            layout: 'vertical',
            component: ({ onSubmit, __onInnerSubmit, ...rest }: any) => {
              return <form {...rest} onSubmit={__onInnerSubmit} />;
            }
          }}
          triggers={triggers}
          debounce={debounceTime}
          form={form}
          initialValues={{ stars: 4 }}
          subscribe={function* ({ field, value }) {
            yield addMiddleware(form, (call, next) => {
              console.log(
                call.name,
                call.context?.field?.name ?? call.context?.name,
                call.args

                // JSON.stringify(call.args, null, 2),
                // JSON.stringify(call.context, null, 2)
              );
              next(call);
            });

            yield autorun(() => {
              if (value('stars') !== 5) {
                field('reason')?.setShow(true);
              } else {
                field('reason')?.setValue('');
              }
            });
            // field('stars')!.setIgnored(true);
          }}
        >
          <DisplayRender />
          <Item
            name="stars"
            rule={{
              minimum: 4,
              validator: (val: number) => {
                return val !== 2;
              },
              warningKeys: ['minimum'],
              errorMessage: {
                validator: '不可以是2星',
                minimum: '至少是4星'
              }
            }}
            asyncRule={{
              asyncValidator: async (val: number) => {
                await new Promise((r) => setTimeout(r, 2000));
                return val !== 1;
              },
              errorMessage: '不能为1星'
            }}
          >
            {({ field, form }) => (
              <AntdForm.Item
                label="评分"
                validateStatus={
                  ((field.visited || form.everValitated) &&
                    validateMapper[field.validation.status]) ||
                  undefined
                }
                help={
                  (field.visited || form.everValitated) &&
                  field.validation.messages.join(', ')
                }
                extra={field.validation.status}
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
          <Item
            name="reason"
            rule={{
              type: 'string',
              minLength: 10,
              errorMessage: '请输入原因，长度至少10位'
            }}
          >
            {({ field, form }) => (
              <AntdForm.Item
                style={field.show ? undefined : { display: 'none' }}
                label="不给5星的理由"
                validateStatus={
                  ((field.visited || form.everValitated) &&
                    validateMapper[field.validation.status]) ||
                  undefined
                }
                help={
                  (field.visited || form.everValitated) &&
                  field.validation.messages.join(', ')
                }
                extra={field.validation.status}
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
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginBottom: '1rem' }}
                loading={form.validating}
              >
                提交
              </Button>
            )}
          </Observer>
          <Button
            onClick={() => {
              form.reset();
            }}
          >
            重置
          </Button>
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
