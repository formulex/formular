import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormInstance } from '@formular/core/lib/src2/models';
import { useLocalStore, Observer } from 'mobx-react';
import { reaction, autorun } from 'mobx';
import { runWithResolvers } from '@formular/core/lib/src2/sideEffect';
import { Item } from '../../src/src2';
import { Form, useFieldContext, useSetup } from '../../src/src2';
import { isAlive } from 'mobx-state-tree';
import { DisplayRender } from './DisplayRender';
import { delay } from './delay';

const DynamicScope: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(function timeout() {
      setLoading(false);
    }, 100);
  }, [setLoading]);

  const zongjia = useRef<any>();

  const form = useFieldContext();
  useSetup(form, function* ({ field }) {
    yield autorun(() => {
      if (field('总价')) {
        zongjia.current = field('总价');
      }

      if (zongjia.current) {
        console.log(zongjia.current.extend.size);
        console.log(
          'is alive = ',
          isAlive(zongjia.current),
          // isAlive(zongjia.current.extend),
          zongjia.current.extend.set('fsdjlf', 'fjsldfj')
        );
      }

      console.log(field('总价')?.extend.get('validation')?.toJSON());
    });
  });

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
                  onBlur={() => field.blur()}
                  onFocus={() => field.focus()}
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
                onBlur={() => field.blur()}
                onFocus={() => field.focus()}
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
                onBlur={() => field.blur()}
                onFocus={() => field.focus()}
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

export const App: React.FC = () => {
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

          yield autorun(() => {
            console.log(field('greeting')?.extend.get('validation')?.toJSON());
          });
        }}
      >
        {({ form }) => (
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
                                        onBlur={() => field.blur()}
                                        onFocus={() => field.focus()}
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
                                        onBlur={() => field.blur()}
                                        onFocus={() => field.focus()}
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
                          onBlur={() => field.blur()}
                          onFocus={() => field.focus()}
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
                      onBlur={() => field.blur()}
                      onFocus={() => field.focus()}
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
                      onBlur={() => field.blur()}
                      onFocus={() => field.focus()}
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
                {() => <pre>{JSON.stringify(form.values, null, 2)}</pre>}
              </Observer>
              <Observer>
                {() => <pre>{JSON.stringify(form.initialValues, null, 2)}</pre>}
              </Observer>
              <Observer>
                {() => <pre>{JSON.stringify(form, null, 2)}</pre>}
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
