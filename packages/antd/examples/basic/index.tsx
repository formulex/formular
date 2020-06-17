import React, { useCallback } from 'react';
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
import { ColumnType } from 'antd/lib/table';
import {
  useSideEffects,
  Registry,
  useForm,
  RenderConfigProvider,
  useFieldContext
} from '@formular/react';
import { runWithResolvers, FieldInstance } from '@formular/core';
import RJV from 'react-json-view';
import { addMiddleware } from 'mobx-state-tree';

Registry.registerGlobalFields({
  ...components
  // TableArray: (props: any) => {
  //   const renderAfter = useCallback(({ $meta: { field } }) => {
  //     return field.editable ? (
  //       <Button onClick={() => field.push()}>添加一个</Button>
  //     ) : null;
  //   }, []);
  //   const enhanceColumns = useCallback(
  //     (columns: ColumnType<any>[], { $meta: { field, form, fields } }) => {
  //       return field.editable
  //         ? columns.concat([
  //             {
  //               key: 'action',
  //               title: '操作',
  //               render: (_, __, index) => {
  //                 return (
  //                   <Button.Group style={{ marginBottom: '24px' }}>
  //                     <Button
  //                       onClick={() => {
  //                         field.remove(index);
  //                       }}
  //                     >
  //                       删除
  //                     </Button>
  //                     <Button
  //                       onClick={() => {
  //                         field.push();
  //                         const prePath = field.name;
  //                         setTimeout(() => {
  //                           runWithResolvers(form, ({ field, value }) => {
  //                             columns.forEach(({ key }) => {
  //                               field(
  //                                 `${prePath}[${fields.length}].${key}`
  //                               )!.setValueSilently(
  //                                 value(`${prePath}[${index}].${key}`)
  //                               );
  //                             });
  //                           });
  //                         });
  //                       }}
  //                     >
  //                       复制并新增到尾端
  //                     </Button>
  //                   </Button.Group>
  //                 );
  //               }
  //             }
  //           ])
  //         : columns;
  //     },
  //     []
  //   );
  //   return (
  //     <components.TableArray
  //       {...props}
  //       renderAfter={renderAfter}
  //       enhanceColumns={enhanceColumns}
  //     />
  //   );
});

// const uploadButton = (
//   <div>
//     <PlusOutlined />
//     <div className="ant-upload-text">上传</div>
//   </div>
// );

const options = [
  { value: 'Linhu', label: '林虎🐯' },
  { value: 'Kelao', label: '克劳🐺' },
  { value: 'Shuqi', label: '书齐🐱' }
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
  useSideEffects(function* ({ field }) {
    yield autorun(() => {
      store.setFieldX(field(name));
    });
  });
  return <Observer>{() => <>{children(store.fieldx)}</>}</Observer>;
};

// const ReuseLogic: React.FC = ({ children }) => {
//   useSideEffects(function* ({ value, fieldsEffects }) {
//     const dis = fieldsEffects('^table\\[(\\d+)\\].wholename', function* (
//       wholename,
//       tokens
//     ) {
//       const fieldIndex = Number(tokens[1]);
//       yield autorun(() => {
//         wholename.silentValue =
//           value(`table[${fieldIndex}].firstname`) +
//           ' ' +
//           value(`table[${fieldIndex}].lastname`);
//       });
//     });
//     yield () => {
//       console.log('dis');
//       dis();
//     };
//     // const entries = fieldsPattern('^table\\[(\\d+)\\].wholename');
//     // yield reaction(
//     //   () => entries.map(({ field }) => field.name),
//     //   () => {
//     //     const fieldIndex = Number(tokens[1]);
//     //     autorun(() => {
//     //       if (field) {
//     //         field.silentValue = value(`table[${fieldIndex}].firstname`)
//     //           ? `${value(`table[${fieldIndex}].firstname`) || ''} ${
//     //               value(`table[${fieldIndex}].lastname`) || ''
//     //             }`
//     //           : undefined;
//     //       }
//     //     });
//     //   }
//     // );
//     // for (const { field, tokens } of fieldsPattern(
//     //   '^table\\[(\\d+)\\].wholename'
//     // )) {
//     //   const fieldIndex = Number(tokens[1]);
//     //   yield autorun(() => {
//     //     if (field) {
//     //       field.silentValue = value(`table[${fieldIndex}].firstname`)
//     //         ? `${value(`table[${fieldIndex}].firstname`) || ''} ${
//     //             value(`table[${fieldIndex}].lastname`) || ''
//     //           }`
//     //         : undefined;
//     //     }
//     //   });
//     // }
//   });
//   return <>{children}</>;
// };

const rule = { type: 'boolean', errorMessage: '必填' };

const App: React.FC = () => {
  const [form] = useForm();
  return (
    <>
      <RenderConfigProvider value={{ emptyContent: '<empty>' }}>
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
          subscribe={function* ({ field, value, fieldsEffects }, form) {
            yield reaction(
              () => value('greeting'),
              async (greetingValue) => {
                await new Promise((r) => setTimeout(r, 1000));
                field('greetingAsync')!.value = greetingValue;
              }
            );

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

            // yield fieldsEffects('.*', function* (field) {
            //   field.setDisabled(true);
            // });

            // yield addMiddleware(form, (call, next) => {
            //   if (call.type === 'action') {
            //     console.log(call);
            //   }
            //   next(call);
            // });
          }}
        >
          <Field
            label="问候"
            name="greeting"
            initialValue="hello!"
            component="Input"
            plain={false}
            componentProps={{ placeholder: '请随便输入' }}
          />
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
              minLength: 5,
              errorMessage: 'The length is at least 5'
            }}
            componentProps={{
              style: { width: '360px' },
              placeholder: '这里将会自动同步在`问候`里的内容'
            }}
          />
          <Field
            label="距离"
            name="distance"
            component="InputNumber"
            // addonAfter="米"
          />
          <DynamicPropsLogic name="isFurry">
            {(field) => (
              <Field
                label="是小动物吗"
                name="isFurry"
                component="Checkbox"
                componentProps={{
                  children: field && (field.value ? '是小动物' : '不是小动物')
                }}
                rule={rule}
              />
            )}
          </DynamicPropsLogic>
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
          {/*


          <Field
            label="喜欢的水果单选"
            name="favsingleFood"
            component="RadioGroup"
            componentProps={{ options: plainOptions }}
          />

          <Field
            label="人选"
            name="person"
            component="Select"
            initialValue="lucy"
            enum={[
              { value: 'lucy', label: '露西' },
              { value: 'will', label: '威尔' },
              { value: 'you-know-who', label: '神秘人', disabled: true }
            ]}
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
            componentProps={{
              options: [
                { value: 'lucy', label: '露西' },
                { value: 'will', label: '威尔' },
                { value: 'you-know-who', label: '神秘人', disabled: true }
              ]
            }}
          />
          <Field
            label="标签"
            name="tags"
            component="TagSelect"
            initialValue={['ggb']}
            componentProps={{
              options: [
                { value: 'lucy', label: '露西' },
                { value: 'will', label: '威尔' },
                { value: 'you-know-who', label: '神秘人' }
              ]
            }}
          />
          <Field
            label="上传"
            name="uploadsTest"
            component="Upload"
            componentProps={{
              action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
              listType: 'picture-card',
              // listType: 'picture',
              children: uploadButton
            }}
          />

          <ReuseLogic>
            <Field
              label="表格"
              name="table"
              type="array"
              component="TableArray"
            >
              <Field
                label="前名字"
                name="firstname"
                component="Input"
                rule={{
                  type: 'string',
                  minLength: 1,
                  errorMessage: '该字段非空'
                }}
                componentProps={{ placeholder: '请输入FirstName' }}
              />
              <Field
                label="后名字"
                name="lastname"
                component="Input"
                rule={{
                  type: 'string',
                  minLength: 1,
                  errorMessage: '该字段非空'
                }}
                componentProps={{ placeholder: '请输入LastName' }}
              />
              <Field
                label="全名字"
                name="wholename"
                component="Input"
                rule={{
                  type: 'string',
                  minLength: 1,
                  errorMessage: '该字段非空'
                }}
                componentProps={{ placeholder: '自动计算', disabled: true }}
              />
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
        </Form>
      </RenderConfigProvider>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
