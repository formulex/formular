import { createForm, FormInstance, FieldInstance } from '@formular/core';
import { render } from 'react-dom';
import { Container, Item } from '../../src';
import React, { useRef, createRef, useEffect, useState } from 'react';
import { useForm } from '../../src/hooks/useForm';
import * as m from 'mobx';
import {
  observer,
  useLocalStore,
  useAsObservableSource,
  Observer
} from 'mobx-react';
(window as any).m = m;

(window as any).base = createForm({
  initialValues: { daddy: 'hello' }
});

class Bpp extends React.Component {
  formRef = React.createRef<FormInstance>();

  form = m.observable.box<FormInstance>(null, { deep: false });

  componentDidMount() {
    this.form.set(this.formRef.current);
  }

  render() {
    return (
      <Container
        ref={this.formRef}
        setup={({ field }) => {
          field('WholeName').setValue(
            field('firstName').value + ' ' + field('LastName').value
          );
        }}
      >
        <div>
          <Item name="firstName" initialValue={'hello formular'}>
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
          <Item name="LastName" initialValue={'learning furry'}>
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
          <Item name="WholeName" initialValue={'Zhiyu'}>
            {({ field, name }) => (
              <div>
                <h3>{name}</h3>
                <div>
                  <input
                    style={{ width: '500px' }}
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
          <Observer>
            {() => <pre>{JSON.stringify(this.form.get(), null, 2)}</pre>}
          </Observer>
        </div>
      </Container>
    );
  }
}

const App: React.FC = () => {
  const form = useForm();

  return (
    <Container
      form={form}
      setup={({ field }) => {
        field('WholeName').setValue(
          field('firstName').value + ' ' + field('LastName').value
        );
      }}
    >
      <div>
        <Item name="firstName" initialValue={'hello formular'}>
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
        <Item name="LastName" initialValue={'learning furry'}>
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
        <Item name="WholeName" initialValue={'Zhiyu'}>
          {({ field, name }) => (
            <div>
              <h3>{name}</h3>
              <div>
                <input
                  style={{ width: '500px' }}
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
        <Observer>{() => <pre>{JSON.stringify(form, null, 2)}</pre>}</Observer>
      </div>
    </Container>
  );
};

render(<Bpp />, document.getElementById('app'));
