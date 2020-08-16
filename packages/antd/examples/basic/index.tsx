import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Field } from '../../src';
import { reaction, autorun } from 'mobx';
import { Observer, useLocalStore } from 'mobx-react';
import { Card } from 'antd';
import * as components from '../../src/components';
import { PlusOutlined } from '@ant-design/icons';
import { useFieldEffects, Registry, PlainConfigContext } from '@formular/react';
import { FieldInstance, getIn, createForm } from '@formular/core';
import RJV from 'react-json-view';
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {});
}
// import { XTableProps } from '../../src/components';
// import { ColumnType } from 'antd/lib/table';
// import { DatePicker } from '../../src/components/DatePickterMoment';

// const enhanceColumns: XTableProps['enhanceColumns'] = (
//   columns: ColumnType<any>[],
//   { meta: { field, form } }
// ) => {
//   return !field.plain
//     ? columns.concat([
//         {
//           key: 'action',
//           title: '操作',
//           render: (_, __, index) => {
//             return (
//               <Button.Group style={{ marginBottom: '24px' }}>
//                 <Button
//                   onClick={() => {
//                     field.remove(index);
//                   }}
//                 >
//                   删除
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     console.log(
//                       Array.from(form.fields.entries()).map(([key, field]) =>
//                         console.log(key, field.value)
//                       )
//                     );
//                     console.log(
//                       'push',
//                       `${field.name}[${index}]`,
//                       getIn(field.value, `[${index}]`)
//                     );
//                     field.push(form.resolve(`${field.name}[${index}]`)?.value);
//                   }}
//                 >
//                   复制并新增到尾端
//                 </Button>
//               </Button.Group>
//             );
//           }
//         }
//       ])
//     : columns;
// };

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

const DynamicPropsLogic: React.FC<{
  name: string;
  children: (field?: FieldInstance) => React.ReactNode;
}> = ({ children, name }) => {
  const store = useLocalStore(() => ({
    fieldx: undefined as undefined | FieldInstance,
    setFieldX: (val?: FieldInstance) => {
      store.fieldx = val;
    }
  }));
  useFieldEffects(function* ({ field }) {
    yield autorun(() => {
      store.setFieldX(field(name));
    });
  });
  return <Observer>{() => <>{children(store.fieldx)}</>}</Observer>;
};

const ReuseLogic: React.FC = ({ children }) => {
  useFieldEffects(function* ({ value, fieldsEffects }) {
    yield fieldsEffects('^table\\[(\\d+)\\].wholename', function* (
      wholename,
      tokens
    ) {
      const fieldIndex = Number(tokens[1]);

      yield reaction(
        () => [
          value(`table[${fieldIndex}].firstname`),
          value(`table[${fieldIndex}].lastname`)
        ],
        ([first, last]) => {
          wholename.change(first + ' ' + last);
        }
      );
    });
  });
  return <>{children}</>;
};

const rule = { required: true, message: '必填' };

const App: React.FC = () => {
  const form = useMemo(() => createForm(), []);
  useEffect(
    () =>
      autorun(() => {
        console.log(form.resolve('table')?.value);
        if (form.resolve('favAnimal')) {
          console.log('1', form.resolve('favAnimal')!.value);
          console.log('2', form.values.favAnimal);
          console.log(
            '3',
            form.resolve('favAnimal')!.value === form.values.favAnimal
          );
        }
      }),
    []
  );
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
            console.log('errors', errors);
          }}
          effects={function* ({ field, value, form }) {
            yield reaction(
              () => value('greeting'),
              async (greetingValue) => {
                await new Promise((r) => setTimeout(r, 1000));
                field('greetingAsync')!.change(greetingValue);
              }
            );

            // yield reaction(
            //   () => value<boolean>('isFurry'),
            //   (isFurry) => {
            //     field('favAnimal')!.show = field(
            //       'bestFavAnimal'
            //     )!.show = Boolean(isFurry);

            //     field('favAnimal')!.ignored = field(
            //       'bestFavAnimal'
            //     )!.ignored = !isFurry;

            //     if (!isFurry) {
            //       form.resetFields(['favAnimal', 'bestFavAnimal']);
            //     }
            //   },
            //   { fireImmediately: true }
            // );
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
            initialValue="hello!"
            component="Password"
            componentProps={{ placeholder: '请随便输入' }}
          />
          <Field
            label="异步的问候"
            name="greetingAsync"
            component="Input"
            rule={{
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
            component="Checkbox"
            // componentProps={({ field }) => ({
            //   children: field && (field.value ? '是小动物' : '不是小动物')
            // })}
            rule={{ ...rule }}
          />
          <Field
            label="你喜欢的小动物"
            name="favAnimal"
            component="CheckboxGroup"
            enum={options}
          />
          <Field
            label="你最最喜欢的小动物"
            name="bestFavAnimal"
            component="RadioGroup"
            enum={options}
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
            initialValue={['ggb']}
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
                    rule: {
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
                    rule: {
                      type: 'string',
                      errorMessage: '该字段非空'
                    },
                    componentProps: { placeholder: '请输入LastName' }
                  },
                  {
                    name: 'wholename',
                    label: '全名字',
                    component: 'Input',
                    rule: {
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
            <Button htmlType="reset" style={{ marginLeft: '1rem' }}>
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
          </Field>
          <Card style={{ marginTop: '1rem' }}>
            <Observer>{() => <RJV src={form.values} />}</Observer>
          </Card>
          <Card style={{ marginTop: '1rem' }}>
            <Observer>{() => <RJV src={form.values} />}</Observer>
          </Card>
        </Form>
      </PlainConfigContext.Provider>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
