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
import React, { useCallback, useEffect, useState } from 'react';
import { Observer } from 'mobx-react';
import { untracked } from 'mobx';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function useRefCurrent<S>(ref: React.RefObject<S>): S | null {
  const [current, setCurrent] = useState<null | S>(null);

  useEffect(() => {
    setCurrent(ref.current);
  }, []);

  return current;
}

const App: React.FC = () => {
  const [form] = useForm({
    initialValues: {
      greeting: 'daddy',
      greeting2: 'mommy',
      TestCase1: {
        数量: 30
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

  return (
    <Container
      form={form}
      auto={() => {
        // field('greetingSync').value = value<string>('greeting');
        console.log(1);
        // field('greetingSync').setValidatorKeys(['required']);
        // field('greetingSync')
        //   .validate()
        //   .then((result) => {
        //     console.log('result', result);
        //   });
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
            value('总价');
            untracked(() => {
              if (value('数量')) {
                field('单价').value = value('总价') / value('数量');
              }
            });
          },
          () => {
            value('单价');
            untracked(() => {
              if (value('数量')) {
                field('总价').value = value('单价') * value('数量');
              }
            });
          },
          () => {
            value('数量');
            untracked(() => {
              if (value('单价')) {
                field('总价').value = value('单价') * value('数量');
              }
            });
          }
        ]}
      >
        <Item name="总价">
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  type="text"
                  value={(field.value as any) || ''}
                  onChange={(e) => {
                    field.setValue(Number.parseFloat(e.target.value));
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
                    field.setValue(Number.parseFloat(e.target.value));
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
                    field.setValue(Number.parseFloat(e.target.value));
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
      </div>
    </Container>
  );
};

render(<App />, document.getElementById('app'));
