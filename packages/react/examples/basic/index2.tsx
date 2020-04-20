import { render } from 'react-dom';
import { Form, Item, withContext, watchEffect } from '../../src/src2';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Observer, useLocalStore } from 'mobx-react';
import { FormInstance } from '@formular/core/lib/src2/models/form';
import m from 'mobx-devtools-mst';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DynamicScope: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(function timeout() {
      setLoading(false);
    }, 100);
  }, [setLoading]);

  if (loading) {
    return <div>loading...{React.version}</div>;
  }

  return (
    <>
      <button onClick={() => setShow((val) => !val)}>
        {show ? 'hide' : 'show'}
      </button>
      {show ? (
        <Item name="总价">
          {({ field }) => (
            <div>
              <h3>{field.name}</h3>
              <div>
                <input
                  style={{ width: '500px' }}
                  type="text"
                  value={(field.value as any) || ''}
                  onChange={(e) => {
                    field.setValue(e.target.value);
                  }}
                />
                <br />
              </div>
            </div>
          )}
        </Item>
      ) : null}
      <Item name="单价">
        {({ field }) => (
          <div>
            <h3>{field.name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
            </div>
          </div>
        )}
      </Item>

      <Item name="数量">
        {({ field }) => (
          <div>
            <h3>{field.name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
            </div>
          </div>
        )}
      </Item>
    </>
  );
};
const App: React.FC = () => {
  const [, forceUpdate] = useState();
  const formRef = useRef<FormInstance>();
  const store = useLocalStore(() => ({
    type: void 0 as 'array' | undefined,
    initialValue: void 0 as any,
    toggleType: () => {
      store.type = store.type === 'array' ? void 0 : 'array';
    },
    setInit: (val: any) => {
      store.initialValue = val;
    }
  }));
  useEffect(() => {
    if (formRef.current) {
      m(formRef.current);
      forceUpdate({});
      // formRef.current.field('greeting')?.setType(void 0);
    }
  }, []);

  const handleReset = useCallback(() => {
    formRef.current?.reset();
  }, []);

  return (
    <Form
      ref={formRef as any}
      setup={({ field, value }) => {
        watchEffect((r) => {
          r.trace();
          console.log(field('hello.greetingAsync'));
          // await delay(500);
          field('hello.greetingAsync')!.value = value('greeting');
        });
      }}
    >
      {() => (
        <>
          <div>
            <DynamicScope />
            <button
              onClick={() => {
                withContext(formRef.current!, ({ field, value }) => {
                  console.log(
                    1,
                    value('greeting'),
                    Array.isArray(value('greeting'))
                  );
                  if (!Array.isArray(value('greeting'))) {
                    field('greeting')?.toArray();
                    console.log(2, value('greeting'));
                  }
                  field('greeting')?.push(undefined);
                });
              }}
            >
              Add &quot;one&quot;
            </button>
            <button
              onClick={() => {
                withContext(formRef.current!, ({ field }) => {
                  field('greeting')?.pop();
                });
              }}
            >
              Pop &quot;one&quot;
            </button>
            <button onClick={store.toggleType}>toggleType</button>
            <Observer>
              {() => (
                <textarea
                  name="asdf"
                  id="fdf"
                  cols={30}
                  rows={10}
                  value={JSON.stringify(store.initialValue)}
                  onChange={(e) => store.setInit(JSON.parse(e.target.value))}
                ></textarea>
              )}
            </Observer>
          </div>
          <Observer>
            {() => (
              <Item
                name="greeting"
                type={store.type}
                initialValue={store.initialValue}
              >
                {({ field, fields, type }) => (
                  <div>
                    <h3>{fields.name}</h3>
                    {type === 'array' ? (
                      fields.map((name, index) => {
                        return (
                          <React.Fragment key={name}>
                            <h3>#{index + 1}</h3>
                            <Item name={`${name}.firstName`}>
                              {({ field }) => (
                                <div>
                                  <h3>{field.name}</h3>
                                  <div>
                                    <input
                                      style={{ width: '500px' }}
                                      type="text"
                                      value={(field.value as any) || ''}
                                      onChange={(e) => {
                                        field.setValue(e.target.value);
                                      }}
                                    />
                                    <br />
                                    {/* {JSON.stringify(field.messages)} */}
                                  </div>
                                </div>
                              )}
                            </Item>
                            <Item name={`${name}.lastName`}>
                              {({ field }) => (
                                <div>
                                  <h3>{field.name}</h3>
                                  <div>
                                    <input
                                      style={{ width: '500px' }}
                                      type="text"
                                      value={(field.value as any) || ''}
                                      onChange={(e) => {
                                        field.setValue(e.target.value);
                                      }}
                                    />
                                    <br />
                                  </div>
                                </div>
                              )}
                            </Item>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <input
                        style={{ width: '500px' }}
                        type="text"
                        value={(field.value as any) || ''}
                        onChange={(e) => {
                          field.setValue(e.target.value);
                        }}
                      />
                    )}
                  </div>
                )}
              </Item>
            )}
          </Observer>
          <Item
            name="hello.greetingSync"
            initialValue={[{ firstName: '3', lastName: '4' }]}
          >
            {({ field }) => (
              <div>
                <h3>{field.name}</h3>
                <div>
                  <input
                    style={{ width: '500px' }}
                    type="text"
                    value={(field.value as any) || ''}
                    onChange={(e) => {
                      field.setValue(e.target.value);
                    }}
                  />
                  <br />
                </div>
              </div>
            )}
          </Item>
          <Item
            name="hello.greetingAsync"
            initialValue={[{ firstName: '3', lastName: '4' }]}
          >
            {({ field }) => (
              <div>
                <h3>{field.name}</h3>
                <div>
                  <input
                    style={{ width: '500px' }}
                    type="text"
                    value={(field.value as any) || ''}
                    onChange={(e) => {
                      field.setValue(e.target.value);
                    }}
                  />
                  <br />
                </div>
              </div>
            )}
          </Item>
          {/* <Item name="greetingAsync">
        {({ field, name }) => (
          <div>
            <h3>{name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
              {JSON.stringify(field.messages)}
            </div>
          </div>
        )}
      </Item>
      <Item name="greeting2">
        {({ field, name }) => (
          <div>
            <h3>{name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
              {JSON.stringify(field.messages)}
            </div>
          </div>
        )}
      </Item>
      <Item name="greetingSync2">
        {({ field, name }) => (
          <div>
            <h3>{name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
              {JSON.stringify(field.messages)}
            </div>
          </div>
        )}
      </Item>
      <Item name="greetingAsync2">
        {({ field, name }) => (
          <div>
            <h3>{name}</h3>
            <div>
              <input
                style={{ width: '500px' }}
                type="text"
                value={(field.value as any) || ''}
                onChange={(e) => {
                  field.setValue(e.target.value);
                }}
              />
              <br />
              {JSON.stringify(field.messages)}
            </div>
          </div>
        )}
      </Item> */}
          <div>
            <Observer>
              {() => (
                <pre>{JSON.stringify(formRef.current?.values, null, 2)}</pre>
              )}
            </Observer>
            <Observer>
              {() => (
                <pre>
                  {JSON.stringify(formRef.current?.initialValues, null, 2)}
                </pre>
              )}
            </Observer>
            <Observer>
              {() => <pre>{JSON.stringify(formRef.current, null, 2)}</pre>}
            </Observer>
          </div>
          <div>
            {/* <button onClick={handleClick}>Submit</button> */}
            <button onClick={handleReset}>Reset</button>
            {/* <button onClick={handleValidateFields}>ValidateFields</button> */}
          </div>
        </>
      )}
    </Form>
  );
};

render(<App />, document.getElementById('app'));
