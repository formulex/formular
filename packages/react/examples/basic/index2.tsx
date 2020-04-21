import { render } from 'react-dom';
import { Form, Item } from '../../src/src2';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Observer, useLocalStore } from 'mobx-react';
import { FormInstance } from '@formular/core/lib/src2/models/form';
import { runWithResolvers } from '@formular/core/lib/src2/sideEffect';
import { autorun, reaction } from 'mobx';
import whyDidYouRender from '@welldone-software/why-did-you-render';
whyDidYouRender(React, {
  trackAllPureComponents: true,
  trackHooks: true
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DisplayRender: React.FC = () => {
  const renders = React.useRef(0);
  return (
    <div
      style={{
        lineHeight: '30px',
        borderRadius: '15px',
        border: '1px solid #ddd',
        backgroundColor: '#eee',
        textAlign: 'center',
        height: '30px',
        width: '30px',
        position: 'relative',
        top: 0,
        right: 0,
        fontSize: 'normal'
      }}
    >
      {++renders.current}
    </div>
  );
};

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
    toggleType: () => {
      store.type = store.type === 'array' ? void 0 : 'array';
    }
  }));
  const [initialValue, setInit] = useState('hello');
  useEffect(() => {
    if (formRef.current) {
      // addMiddleware(formRef.current, actionLogger);
      forceUpdate({});
      // formRef.current.field('greeting')?.setType(void 0);
    }
  }, []);

  const handleReset = useCallback(() => {
    formRef.current?.reset();
  }, []);

  return (
    <>
      <Form
        ref={formRef as any}
        subscribe={function* ({ field, value }) {
          yield reaction(
            () => value('greeting'),
            async () => {
              await delay(500);
              field('hello.greetingAsync')!.value = value('greeting');
            }
          );
          yield autorun(() => {
            field('hello.greetingSync')!.value = value('greeting');
          });
        }}
      >
        {() => (
          <>
            <div>
              <DisplayRender />
              <DynamicScope />
              <button
                onClick={() => {
                  forceUpdate({});
                }}
              >
                forceUpdate
              </button>
              <button
                onClick={() => {
                  runWithResolvers(formRef.current!, ({ field, value }) => {
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
                  runWithResolvers(formRef.current!, ({ field }) => {
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
                    value={JSON.stringify(initialValue)}
                    onChange={(e) => setInit(JSON.parse(e.target.value))}
                  ></textarea>
                )}
              </Observer>
            </div>
            <Observer>
              {() => (
                <Item name="greeting" type={store.type}>
                  {({ field, fields, type }) => (
                    <div>
                      <DisplayRender />
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
            <Item name="hello.greetingSync" initialValue={initialValue}>
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
            <Item name="hello.greetingAsync">
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
              <button onClick={handleReset}>Reset</button>
            </div>
          </>
        )}
      </Form>
      <DisplayRender />
    </>
  );
};

render(<App />, document.getElementById('app'));
