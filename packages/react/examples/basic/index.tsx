import { createForm } from '@formular/core';
import { render } from 'react-dom';
import {
  Container,
  Item,
  Scope,
  value,
  field,
  withContext,
  asyncEffect
} from '../../src';
import React from 'react';
import { useForm } from '../../src/hooks/useForm';
import * as m from 'mobx';
import { Observer } from 'mobx-react';
(window as any).m = m;

(window as any).base = createForm({
  initialValues: { daddy: 'hello' }
});

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const App: React.FC = () => {
  const form = useForm();

  return (
    <Container
      form={form}
      reactions={[
        [
          () => value<string>('greeting'),
          asyncEffect(function*(greeting: string) {
            field('greetingSync').setValue(greeting);
            yield delay(5000);
            field('greetingAsync').setValue(greeting);
          })
        ],
        [
          () => value<string>('greeting2'),
          asyncEffect(function*(greeting: string) {
            field('greetingSync2').setValue(greeting);
            yield delay(2000);
            field('greetingAsync2').setValue(greeting);
          })
        ]
      ]}
    >
      <Scope
        name="TestCase1"
        reactions={[
          [
            () => value('总价'),
            totalValue => {
              if (value('单价')) {
                field('数量').setValue(totalValue / value<number>('单价'));
              }
            }
          ],
          [
            () => value('单价'),
            priceValue => {
              if (value('数量')) {
                field('总价').setValue(priceValue * value<number>('数量'));
              } else if (value('总价')) {
                field('数量').setValue(value<number>('总价') / priceValue);
              }
            }
          ],
          [
            () => value('数量'),
            count => {
              if (value('单价')) {
                field('总价').setValue(count * value<number>('单价'));
              }
            }
          ]
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
                  onChange={e => {
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
                  onChange={e => {
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
                  onChange={e => {
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
                onChange={e => {
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
                onChange={e => {
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
                onChange={e => {
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
                onChange={e => {
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
                onChange={e => {
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
                onChange={e => {
                  field.setValue(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </Item>
      <div>
        <Observer>
          {() => <pre>{JSON.stringify(form.value, null, 2)}</pre>}
        </Observer>
        <Observer>{() => <pre>{JSON.stringify(form, null, 2)}</pre>}</Observer>
      </div>
    </Container>
  );
};

render(<App />, document.getElementById('app'));
