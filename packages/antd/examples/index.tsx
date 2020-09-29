import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Field } from '../src';
import { reaction, autorun } from 'mobx';
import { Observer } from 'mobx-react';
import { Card } from 'antd';
import * as components from '../src/components';
import { PlusOutlined } from '@ant-design/icons';
import { Registry, PlainConfigContext } from '@formular/react';
import { createForm } from '../../core/src';
import RJV from 'react-json-view';
import { applySnapshot, getSnapshot } from 'mobx-state-tree';
import { from } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { toStream } from 'mobx-utils';
import { BaseRule } from '@formular/core/lib/models/field/inner-features/validation/interface';
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {});
}

Registry.registerGlobalFields({
  ...components
});

const uploadButton = (
  <div>
    <PlusOutlined />
    <div className="ant-upload-text">上传</div>
  </div>
);

const options = [
  { value: 'Linhu', label: '林虎🐯' },
  { value: 'Kelao', label: '克劳🐺' },
  { value: 'Shuqi', label: '书齐🐱' }
];

const maplestoryOptions = [
  { value: 'lucy', label: '露西' },
  { value: 'will', label: '威尔' },
  { value: 'you-know-who', label: '神秘人', disabled: true }
];

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

// const DynamicPropsLogic: React.FC<{
//   name: string;
//   children: (field?: FieldInstance) => React.ReactNode;
// }> = ({ children, name }) => {
//   const store = useLocalStore(() => ({
//     fieldx: undefined as undefined | FieldInstance,
//     setFieldX: (val?: FieldInstance) => {
//       store.fieldx = val;
//     }
//   }));
//   useFieldEffects(function* ({ field }) {
//     yield autorun(() => {
//       store.setFieldX(field(name));
//     });
//   });
//   return <Observer>{() => <>{children(store.fieldx)}</>}</Observer>;
// };

// const ReuseLogic: React.FC = ({ children }) => {
//   useFieldEffects(function* ({ value, fieldsEffects }) {
//     yield fieldsEffects('^table\\[(\\d+)\\].wholename', function* (
//       wholename,
//       tokens
//     ) {
//       const fieldIndex = Number(tokens[1]);

//       yield reaction(
//         () => [
//           value(`table[${fieldIndex}].firstname`),
//           value(`table[${fieldIndex}].lastname`)
//         ],
//         ([first, last]) => {
//           wholename.change(first + ' ' + last);
//         }
//       );
//     });
//   });
//   return <>{children}</>;
// };

const rules: BaseRule = { message: '必填', type: 'boolean' };

const App: React.FC = () => {
  const form = useMemo(() => createForm(), []);
  useEffect(
    () =>
      autorun(() => {
        console.log('form', form.resolve('isFurry')?.value);
      }),
    []
  );

  useEffect(() => {
    setTimeout(() => {
      form.resolve('favAnimal')!.enum = options;
      console.log('done');
    }, 1000);
  }, []);

  const snapshotRef = useRef<any | null>(null);
  return (
    <>
      <PlainConfigContext.Provider value={{ emptyContent: '<empty>' }}>
        <Form
          className="App"
          form={form}
          {...formItemLayout}
          onFinish={(values) => {
            console.log('finish', values);
          }}
          onFinishFailed={(errors) => {
            console.log(form.everValitated);
            console.log('errors', errors);
          }}
          effects={function* ({ field, value, form }) {
            yield reaction(
              () => value<string>('greeting'),
              async (greetingValue) => {
                await new Promise((r) => setTimeout(r, 1000));
                field('greetingAsync')!.change(greetingValue);
              }
            );

            yield from(
              toStream<any>(() => value('greeting'))
            )
              .pipe(debounceTime(500))
              .subscribe((val) => {
                console.log('greeting: ', val);
              });

            yield reaction(
              () => value<boolean>('isFurry'),
              (isFurry) => {
                field('favAnimal')!.show = field(
                  'bestFavAnimal'
                )!.show = Boolean(isFurry);

                field('favAnimal')!.ignored = field(
                  'bestFavAnimal'
                )!.ignored = !isFurry;

                if (!isFurry) {
                  form.resetFields(['favAnimal', 'bestFavAnimal']);
                }
              },
              { fireImmediately: true }
            );
          }}
        >
          <Field
            label="问候"
            name="greeting"
            initialValue="hello!"
            component="Input"
            plain={false}
            componentProps={{ placeholder: '请随便输入' }}
          >
            suffix
          </Field>
          <Field
            label="密码测试"
            name="password"
            component="Password"
            rules={[{ required: true, message: '密码不能为空' }]}
            componentProps={{ placeholder: '请随便输入' }}
          />
          <Field
            label="异步的问候"
            name="greetingAsync"
            component="Input"
            rules={{
              type: 'string',
              min: 5,
              message: 'The length is at least 5'
            }}
            componentProps={{
              style: { width: '360px' },
              placeholder: '这里将会自动同步在`问候`里的内容'
            }}
          />
          <Field
            label="TextArea"
            name="textarea"
            initialValue="hello!"
            component="TextArea"
            componentProps={{ placeholder: '请随便输入' }}
          />
          <Field label="距离" name="distance" component="InputNumber">
            <span style={{ marginLeft: '.2rem' }}>meters</span>
          </Field>
          <Field
            label="DatePicker"
            name="date"
            component="DatePicker"
            componentProps={{
              showTime: true,
              format: 'dddd, MMMM Do YYYY, h:mm:ss a'
            }}
          />
          <Field
            label="是小动物吗"
            name="isFurry"
            initialValue={true}
            component="Checkbox"
            componentProps={({ field }) => ({
              children: field && (field.value ? '是小动物' : '不是小动物')
            })}
            rules={rules}
          />
          <Field
            label="你喜欢的小动物"
            name="favAnimal"
            component="CheckboxGroup"
            required
            rules={{ required: true, message: 'required' }}
          />
          <Field
            label="你最最喜欢的小动物"
            name="bestFavAnimal"
            component="RadioGroup"
            // enum={options}
          />
          <Field
            label="人选"
            name="person"
            component="Select"
            initialValue="lucy"
            enum={maplestoryOptions}
            componentProps={{
              showSearch: true,
              filterOption: (input: string, option: any) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
          />
          <Field
            label="人选多选"
            name="personmulti"
            component="MultipleSelect"
            initialValue={['will']}
            enum={maplestoryOptions}
            componentProps={{
              onChange: (e: any) => {
                console.log('listen e', e);
              }
            }}
          />
          <Field
            label="标签"
            name="tags"
            component="TagSelect"
            // initialValue={['ggb']}
            enum={[
              { value: 'lucy', label: '露西' },
              { value: 'will', label: '威尔' },
              { value: 'you-know-who', label: '神秘人' }
            ]}
          />
          <Field
            label="上传"
            name="uploadsTest"
            component="Upload"
            componentProps={{
              action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
              listType: 'picture-card',
              children: uploadButton
            }}
          />
          {/* <ReuseLogic>
            <Field
              label="表格"
              name="table"
              type="array"
              component="TableArray"
              initialValue={[
                { firstname: 'ggb', lastname: 'ggb', wholename: 'happy' }
                // null,
                // null
              ]}
              componentProps={{
                size: 'small',
                enhanceColumns,
                itemFields: [
                  {
                    name: 'firstname',
                    label: '前名字',
                    component: 'Input',
                    rules: {
                      type: 'string',
                      minLength: 1,
                      errorMessage: '该字段非空'
                    },
                    componentProps: { placeholder: '请输入FirstName' }
                  },
                  {
                    name: 'lastname',
                    label: '后名字',
                    component: 'Input',
                    rules: {
                      type: 'string',
                      errorMessage: '该字段非空'
                    },
                    componentProps: { placeholder: '请输入LastName' }
                  },
                  {
                    name: 'wholename',
                    label: '全名字',
                    component: 'Input',
                    rules: {
                      type: 'string',
                      errorMessage: '该字段非空'
                    },
                    componentProps: { placeholder: '自动计算', disabled: true }
                  }
                ]
              }}
            >
              <Observer>
                {() => (
                  <>
                    {!form.plain && (
                      <Button
                        onClick={() => {
                          form.resolve('table')?.push();
                        }}
                      >
                        添加一个
                      </Button>
                    )}
                  </>
                )}
              </Observer>
            </Field>
          </ReuseLogic> */}
          <Field label="panel">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
              }}
              style={{ marginLeft: '1rem' }}
            >
              Reset
            </Button>

            <Button
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                form.plain = !form.plain;
              }}
            >
              Toggle Plain
            </Button>

            <Button
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                snapshotRef.current = getSnapshot(form);
              }}
            >
              Save State
            </Button>

            <Button
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                if (snapshotRef.current) {
                  applySnapshot(form, snapshotRef.current);
                }
              }}
            >
              Restore State
            </Button>
          </Field>
          <Card style={{ marginTop: '1rem' }}>
            <Observer>{() => <RJV src={form.values} />}</Observer>
          </Card>
          <Card style={{ marginTop: '1rem' }}>
            <Observer>{() => <RJV src={form.initialValues} />}</Observer>
          </Card>
        </Form>
      </PlainConfigContext.Provider>
    </>
  );
};

const B: React.FC = () => {
  const [show, setShow] = useState(true);
  return (
    <>
      <Button onClick={() => setShow((val) => !val)}>
        {show ? 'show' : 'unshow'}
      </Button>
      {show ? <App /> : null}
    </>
  );
};

ReactDOM.render(<B />, document.getElementById('app'));
