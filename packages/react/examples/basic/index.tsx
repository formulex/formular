import { createForm, FormInstance } from '@formular/core';
import { render } from 'react-dom';
import { Container } from '../../src';
import React, { useRef, createRef, useEffect } from 'react';
import { useForm } from '../../src/hooks/useForm';
import * as m from 'mobx';
(window as any).m = m;

(window as any).base = createForm({
  initialValues: { daddy: 'hello' }
});

const App: React.FC = () => {
  // const form = useForm();
  const formRef = createRef<FormInstance>();
  useEffect(() => {
    // (window as any).form = form;
    (window as any).formRef = formRef;
  }, [formRef]);
  return (
    <Container
      ref={formRef}
      initialValues={{
        foo: 'bar',
        bar: 123,
        baz: true,
        touming: undefined,
        foofoo: {
          username: 'baozi',
          age: 23
        },
        tag: ['happy', 'nice', 'quick'],
        firends: [
          { name: 'Heskey', age: 22 },
          { name: 'Barbara', age: 25 },
          { name: 'Fiona', age: 24 }
        ]
      }}
    >
      <div>123123</div>
    </Container>
  );
};

render(<App />, document.getElementById('app'));
