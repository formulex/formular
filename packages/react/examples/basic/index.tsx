import { render } from 'react-dom';
import {
  Container,
  Item,
  Scope,
  value,
  field,
  oflow,
  useForm
} from '../../src';
import React, { useCallback } from 'react';
import { Observer } from 'mobx-react';
import { untracked } from 'mobx';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const App: React.FC = () => {
  const [form] = useForm({
    initialValues: {
      greeting: 'daddy',
      greeting2: 'mommy',
      TestCase1: {
        数量: 20
      }
    }
  });

  const handleClick = useCallback(() => {
    console.log(form?.value);
  }, [form]);

  const handleReset = useCallback(async () => {
    await form?.reset();
    console.log('after', form?.value);
  }, [form]);

  const handleValidateFields = useCallback(async () => {
    const results = await form.validateFields();
    console.log('Validate results:', results);
  }, []);

  return (
    <Container
      form={form}
      auto={() => {
        // field('greetingSync').value = value<string>('greeting');
        // console.log(1);
        // field('greetingSync').setValidatorKeys(['required']);
        // field('greetingSync')
        //   .validate()
        //   .then((result) => {
        //     console.log('result', result);
        //   });
        field('TestCase1.总价').value = 100;
      }}
      watch={[
        [
          () => value<string>('greeting'),
          oflow(function* (greeting: string) {
            yield delay(1000);
            field('greetingAsync').value = greeting;
          })
        ],
        [
          () => value<string>('greeting2'),
          oflow(function* (greeting: string) {
            field('greetingSync2').value = greeting;
            yield delay(1000);
            field('greetingAsync2').value = greeting;
          })
        ]
      ]}
    >
      <Scope
        name="TestCase1"
        auto={[
          () => {
            console.log('总价', value('总价'));

            untracked(() => {
              if (value('数量')) {
                field('单价').value = value('总价') / value('数量');
              }
            });
          },
          () => {
            value('单价');
            untracked(() => {
              if (value('数量') && value('单价')) {
                field('总价').value = value('单价') * value('数量');
              }
            });
          }
          // () => {
          //   value('数量');
          //   untracked(() => {
          //     console.log('price', value('单价'));
          //     if (value('单价')) {
          //       field('总价').value = value('单价') * value('数量');
          //     }
          //   });
          // }
        ]}
      >
        <Item
          name="总价"
          rules={[
            'required',
            useCallback((field) => {
              if (Number.parseInt(field.value) === 100) {
                return { no100: true };
              }
              return null;
            }, [])
          ]}
          asyncRules={[
            async (field) => {
              if (Number.parseInt(field.value as any) === 1000) {
                await delay(3000);
                return { no1000: true };
              }
              return null;
            }
          ]}
        >
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  type="text"
                  value={(field.value as any) || ''}
                  onChange={(e) => {
                    console.log('target', e.target.value);
                    field.setValue(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </Item>
        <Item name="单价">
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  type="text"
                  value={(field.value as any) || ''}
                  onChange={(e) => {
                    field.setValue(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </Item>

        <Item name="数量">
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
              </div>
            </div>
          )}
        </Item>
      </Scope>
      <Item name="greeting">
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
            </div>
          </div>
        )}
      </Item>
      <Item name="greetingSync">
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
            </div>
          </div>
        )}
      </Item>
      <Item name="greetingAsync">
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
            </div>
          </div>
        )}
      </Item>
      <div>
        <Observer>
          {() => <pre>{JSON.stringify(form?.value, null, 2)}</pre>}
        </Observer>
        <Observer>{() => <pre>{JSON.stringify(form, null, 2)}</pre>}</Observer>
      </div>
      <div>
        <button onClick={handleClick}>Submit</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleValidateFields}>ValidateFields</button>
      </div>
    </Container>
  );
};

render(<App />, document.getElementById('app'));
