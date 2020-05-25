import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Field, useForm, Registry } from '../../src';
import { reaction } from 'mobx';
import { Observer } from 'mobx-react';
import { Card, Select } from 'antd';
import * as components from '../../src/components';
import { PlusOutlined } from '@ant-design/icons';

Registry.registerGlobalFields(components);
const { Option } = Select;

const uploadButton = (
  <div>
    <PlusOutlined />
    <div className="ant-upload-text">上传</div>
  </div>
);
const plainOptions = ['Apple', 'Pear', 'Orange'];
const options = [
  { value: 'Apple', label: '苹果' },
  { value: 'Pear', label: '雪梨' },
  { value: 'Orange', label: '橘子' }
];
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

const App: React.FC = () => {
  const [form] = useForm();
  return (
    <>
      <Form
        className="App"
        form={form}
        layout="vertical"
        {...formItemLayout}
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
          // initialValue="hello!"
          component="Input"
          editable={true}
        />
        <Field
          label="距离"
          name="distance"
          component="InputNumber"
          addonAfter="米"
        />
        <Field
          label="喜欢吃水果吗"
          name="likeFood"
          component="Checkbox"
          componentProps={{ children: '喜欢吃水果吗？' }}
        />
        <Field
          label="喜欢的水果"
          name="favFood"
          component="CheckboxGroup"
          componentProps={{ options: plainOptions }}
        />
        <Field
          label="喜欢的水果2"
          name="favFood2"
          component="CheckboxGroup"
          componentProps={{ options }}
        />
        <Field
          label="喜欢的水果单选"
          name="favsingleFood"
          component="RadioGroup"
          componentProps={{ options: plainOptions }}
        />
        <Field
          label="喜欢的水果2单选"
          name="favsingleFood2"
          component="RadioGroup"
          componentProps={{ options }}
        />
        <Field
          label="人选"
          name="person"
          component="Select"
          initialValue="will"
          componentProps={{
            options: [
              { value: 'lucy', label: '露西' },
              { value: 'will', label: '威尔' },
              { value: 'you-know-who', label: '神秘人', disabled: true }
            ]
          }}
        />
        <Field
          label="人选children"
          name="personchildren"
          component="Select"
          componentProps={{
            children: (
              <>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>
                  Disabled
                </Option>
                <Option value="Yiminghe">yiminghe</Option>
              </>
            )
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
            style: { width: '240px' }
          }}
        />
        <Field label="panel">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button
            // onClick={() => {
            //   form.resetFields();
            // }}
            htmlType="reset"
            style={{ marginLeft: '1rem' }}
          >
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
        </Field>
        <Card style={{ marginTop: '1rem' }}>
          <Observer>
            {() => <pre>{JSON.stringify(form.values, null, 2)}</pre>}
          </Observer>
        </Card>
      </Form>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
