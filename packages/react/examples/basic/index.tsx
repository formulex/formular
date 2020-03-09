import { createForm, FormInstance } from '@formular/core';
import { render } from 'react-dom';
import { Container, Item } from '../../src';
import React, { useRef, createRef, useEffect, useState } from 'react';
import { useForm } from '../../src/hooks/useForm';
import * as m from 'mobx';
import { observer, useLocalStore, useAsObservableSource } from 'mobx-react';
(window as any).m = m;

(window as any).base = createForm({
  initialValues: { daddy: 'hello' }
});

const App: React.FC = observer(() => {
  // const form = useForm();
  const formRef = createRef<FormInstance>();
  useEffect(() => {
    // (window as any).form = form;
    let form = ((window as any).form = formRef.current);
    // form.registerField('foofoo.username', field => {
    //   const el = document.getElementById('username') as HTMLInputElement;
    //   el.oninput = (e: any) => {
    //     field.setValue(e.target.value);
    //   };
    //   return m.autorun(() => {
    //     el.value = (field.value as string) || '';
    //   });
    // });

    // form.registerField('foo', field => {
    //   const el = document.getElementById('foo') as HTMLInputElement;
    //   el.oninput = (e: any) => {
    //     field.setValue(e.target.value);
    //   };
    //   return m.autorun(() => {
    //     el.value = (field.value as string) || '';
    //   });
    // });
  }, [formRef]);

  const [initVal, setInitVal] = useState('baofdfbao');

  console.log(formRef.current);

  return (
    <Container
      ref={formRef}
      initialValues={{
        // foo: 'bar',
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
      <div>
        <Item name="aa.bb.cc[1][2].hello.world" initialValue={initVal}>
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={e => {
                    field.setValue(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </Item>
        <Item name="aa[0][2].hello.daddy" initialValue={initVal}>
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={e => {
                    field.setValue(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </Item>
      </div>
      <div>
        <input
          type="text"
          value={initVal}
          onChange={e => {
            setInitVal(e.target.value);
          }}
        />
        <pre>{JSON.stringify(formRef.current, null, 2)}</pre>
      </div>
    </Container>
  );
});

render(<App />, document.getElementById('app'));
