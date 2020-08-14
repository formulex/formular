import React from 'react';
import { Formular, FieldWrapper } from '../../src/components';
import { Form, Button, Switch, Card, Input } from 'antd';
import 'antd/dist/antd.css';
import './app.less';
import { Observer } from 'mobx-react';

export const component: React.FC<any> = ({
  handleSubmit,
  onSubmit,
  ...rest
}) => {
  return <form {...rest} onSubmit={handleSubmit ?? onSubmit} />;
};

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  IGNORED: 'default'
};

export const App: React.FC = () => {
  const [plain, setPlain] = React.useState(false);
  const [perishable, setPerishable] = React.useState(false);
  return (
    <Card
      title={
        <div className="header-container">
          <span>
            plain <Switch checked={plain} onChange={setPlain} />
          </span>
          <span>
            perishable <Switch checked={perishable} onChange={setPerishable} />
          </span>
        </div>
      }
    >
      <Formular
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
                {({ field, form }) => {
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
                      {field.plain ? (
                        <span>{field.value}</span>
                      ) : (
                        <Input
                          onFocus={() => field.focus()}
                          onBlur={() => field.blur()}
                          value={field.value}
                          onChange={(e) =>
                            field.change(
                              e.target.value === '' ? undefined : e.target.value
                            )
                          }
                        />
                      )}
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

            <Card title="values">
              <Observer>
                {() => <pre>{JSON.stringify(form.values, null, 2)}</pre>}
              </Observer>
            </Card>

            <Card title="initialValues">
              <Observer>
                {() => <pre>{JSON.stringify(form.initialValues, null, 2)}</pre>}
              </Observer>
            </Card>
          </>
        )}
      </Formular>
    </Card>
  );
};
