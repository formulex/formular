import React from 'react';
import {
  Form,
  FormProps,
  Panel,
  InputProps,
  Input,
  FormGroup,
  ButtonToolbar,
  Button,
  FormControl,
  ControlLabel
} from 'rsuite';
import { asFormContainer, asFormField, useForm, connect } from '../../src';
import { Observer } from 'mobx-react';
import ReactJson from 'react-json-view';

const RForm = asFormContainer<FormProps>({
  getDerivedProps(formComponentProps, injectProps) {
    return {
      ...formComponentProps,
      ...injectProps,
      onSubmit(_: any, event: any) {
        injectProps.onSubmit?.(event);
      }
    };
  }
})(Form);

interface TextFieldProps {
  label?: string;
  name?: string;
  hasError?: boolean;
  message?: string;
}

const noop: React.FC = ({ children }) => {
  return <>{children}</>;
};

const RField = asFormField<TextFieldProps>({
  getDerivedPropsFromFieldMeta({ fieldComponentProps, meta, Component }) {
    const { field, form } = meta;
    return {
      ...fieldComponentProps,
      children: <Component name={fieldComponentProps.name} $meta={meta} />,
      hasError:
        (field.visited || form.everValitated) &&
        field.validation.status === 'INVALID',
      message:
        ((field.visited || form.everValitated) &&
          !field.ignored &&
          field.validation.messages.join(', ')) ||
        '',
      name: field.name
    };
  }
})(
  class TextField extends React.PureComponent<TextFieldProps> {
    render() {
      const { name, label, children, hasError, message } = this.props;
      return (
        <FormGroup className={hasError ? 'has-error' : ''}>
          <ControlLabel htmlFor={name}>{label}</ControlLabel>
          <FormControl accepter={noop} errorMessage={message}>
            {children}
          </FormControl>
        </FormGroup>
      );
    }
  }
);

const RInput = connect<InputProps>({
  getValueFromEvent(val) {
    return val;
  },
  getValueProps(val) {
    return val ?? '';
  }
})(Input);

export const App: React.FC = () => {
  const [form] = useForm();
  return (
    <div style={{ margin: '1rem' }}>
      <Panel header="Rsuite example" shaded>
        <RForm
          form={form}
          onFinish={(values) => {
            console.log('Finished Rsuite', values);
          }}
          onFinishFailed={(errors) => {
            console.log('errors', errors);
          }}
          triggers={['change']}
        >
          <RField
            name="hello"
            label="Hello"
            component={RInput}
            rule={{ type: 'string', errorMessage: '该项必填' }}
          />
          <FormGroup>
            <ButtonToolbar>
              <Button appearance="primary" type="submit">
                Submit
              </Button>
              <Button appearance="default" type="reset">
                Reset
              </Button>
            </ButtonToolbar>
          </FormGroup>
        </RForm>
      </Panel>
      <Panel header="JSON Viewer" shaded style={{ marginTop: '1rem' }}>
        <Observer>{() => <ReactJson src={form.values} />}</Observer>
      </Panel>
    </div>
  );
};
