import { createForm, FormInstance, FieldInstance } from '@formular/core';
import { render } from 'react-dom';
import { Container, Item, Scope } from '../../src';
import React from 'react';
import { useForm } from '../../src/hooks/useForm';
import * as m from 'mobx';
import { Observer } from 'mobx-react';
(window as any).m = m;

(window as any).base = createForm({
  initialValues: { daddy: 'hello' }
});

const App: React.FC = () => {
  const form = useForm();

  return (
    <Container form={form}>
      <Scope
        name="TestCase1"
        // autoRuns={[
        //   ({ field }) => {
        //     if (!field('数量').value || !field('单价').value) {
        //       return;
        //     }
        //     field('总价').setValue(
        //       (field('数量').value as number) * (field('单价').value as number)
        //     );
        //   },
        //   ({ field }) => {
        //     if (!field('总价').value || !field('单价').value) {
        //       return;
        //     }
        //     field('数量').setValue(
        //       (field('总价').value as number) / (field('单价').value as number)
        //     );
        //   },
        //   ({ field }) => {
        //     if (!field('总价').value || !field('数量').value) {
        //       return;
        //     }
        //     field('单价').setValue(
        //       (field('总价').value as number) / (field('数量').value as number)
        //     );
        //   }
        // ]}
        reactions={[
          [
            ({ value }) => value('总价'),
            (totalValue, { field, value }) => {
              if (value('单价')) {
                field('数量').setValue(totalValue / value<number>('单价'));
              }
            }
          ],
          [
            ({ value }) => value('单价'),
            (priceValue, { field, value }) => {
              if (value('数量')) {
                field('总价').setValue(priceValue * value<number>('数量'));
              } else if (value('总价')) {
                field('数量').setValue(value<number>('总价') / priceValue);
              }
            }
          ],
          [
            ({ value }) => value('数量'),
            (count, { field, value }) => {
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
                  value={field.value || ''}
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
                  value={field.value || ''}
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
                  value={field.value || ''}
                  onChange={e => {
                    field.setValue(Number.parseFloat(e.target.value));
                  }}
                />
              </div>
            </div>
          )}
        </Item>
      </Scope>
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
