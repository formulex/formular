import React from 'react';
import {
  Formular,
  FieldWrapper,
  AtomFieldRenderer
} from '../../src/components';
import { Form, Button, Switch, Card, Input } from 'antd';
import 'antd/dist/antd.css';
import './app.less';
import { Observer } from 'mobx-react';
import type { FormInstance } from '@formular/core';
import { asAtomField } from '../../src/components/asAtomField';
import { InputProps } from 'antd/lib/input';
import { Registry } from '../../src/registry';

const FInput = asAtomField<InputProps>()(Input);

Registry.registerGlobalFields({
  FInput
});

export const component: React.FC<any> = ({
  handleSubmit,
  onSubmit,
  ...rest
}) => {
  return <form {...rest} onSubmit={handleSubmit ?? onSubmit} />;
};
component.displayName = 'AntdFormCompatWrapper';

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  IGNORED: 'default'
};

export const App: React.FC = () => {
  const [plain, setPlain] = React.useState(false);
  const [perishable, setPerishable] = React.useState(false);
  const formRef = React.useRef<FormInstance>(null);
  const [, forceUpdate] = React.useState();
  React.useEffect(() => {
    if (formRef.current) {
      forceUpdate({});
    }
  }, [formRef.current]);
  return (
    <>
      <Card
        title={
          <div className="header-container">
            <span>
              plain <Switch checked={plain} onChange={setPlain} />
            </span>
            <span>
              perishable
              <Switch checked={perishable} onChange={setPerishable} />
            </span>
          </div>
        }
      >
        <Formular
          ref={formRef}
          plain={plain}
          perishable={perishable}
          // initialValues={{ hello: 123 }}
          onFinish={(values) => {
            console.log('finished', values);
          }}
        >
          {({ handleSubmit, form }) => (
            <>
              <Form component={component} {...{ handleSubmit }}>
                <FieldWrapper
                  name="hello"
                  initialValue="ggb"
                  rule={{ required: true, message: '该项目必填' }}
                >
                  {(source) => {
                    const { field, form } = source;
                    return (
                      <Form.Item
                        label="HelloLabel"
                        validateStatus={
                          ((field.visited || form.everValitated) &&
                            validateMapper[field.validation.status]) ||
                          undefined
                        }
                        help={
                          (field.visited || form.everValitated) &&
                          !field.ignored &&
                          field.validation.errors.join(', ')
                        }
                      >
                        <AtomFieldRenderer
                          component={FInput}
                          componentProps={{
                            placeholder: 'Hello',
                            allowClear: true
                          }}
                          $source={source}
                        />
                      </Form.Item>
                    );
                  }}
                </FieldWrapper>
                <Button htmlType="submit" type="primary">
                  Submit
                </Button>
                <Button
                  htmlType="reset"
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  Reset
                </Button>
              </Form>
            </>
          )}
        </Formular>
      </Card>
      <Card title="values">
        <Observer>
          {() => <pre>{JSON.stringify(formRef.current?.values, null, 2)}</pre>}
        </Observer>
      </Card>

      <Card title="initialValues">
        <Observer>
          {() => (
            <pre>{JSON.stringify(formRef.current?.initialValues, null, 2)}</pre>
          )}
        </Observer>
      </Card>
    </>
  );
};
