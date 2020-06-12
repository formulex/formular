import React from 'react';
import { connect, useForm } from '@formular/react';
import { Form, Field } from '@formular/antd';
import { Observer } from 'mobx-react';

interface ButtonCounterProps {
  value: number;
  onChange: (value: number) => void;
}

const ButtonCounter: React.FC<ButtonCounterProps> = ({ value, onChange }) => {
  return (
    <button onClick={() => onChange(value + 1)}>
      You clicked me {value} times.
    </button>
  );
};

const XButtonCounter = connect<ButtonCounterProps>({
  getValueFromEvent: (val) => val
})(ButtonCounter);

const App: React.FC = () => {
  const [form] = useForm();
  return (
    <Form form={form}>
      <Field name="times" initialValue={0} component={XButtonCounter} />
      <Observer>
        {() => <pre>{JSON.stringify(form.values, null, 2)}</pre>}
      </Observer>
    </Form>
  );
};

export default App;
