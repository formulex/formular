import React from 'react';
import { Formular } from '../../src/components/Formular';
import { Form, Button, Toggle, Panel } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

export const App: React.FC = () => {
  const [plain, setPlain] = React.useState(false);
  return (
    <Panel
      header={
        <>
          Plain <Toggle checked={plain} onChange={setPlain} />
        </>
      }
    >
      <Formular
        plain={plain}
        onFinish={(values) => {
          console.log('finished', values);
        }}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={(_, event) => handleSubmit(event)}>
            <Button appearance="primary" type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Formular>
    </Panel>
  );
};
