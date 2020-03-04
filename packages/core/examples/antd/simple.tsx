import React, { useEffect } from 'react';
import { Input, Button } from 'antd';
import { useLocalStore, observer } from 'mobx-react';
import { FieldGroup } from '../../src/nodes';

function decorate(target: any, { valuePropName = 'value' } = {}) {
  return (element: React.ReactElement) => {
    return React.cloneElement(element, {
      [valuePropName]: target.value,
      onChange: e => {
        target.setValue(e.target.value);
      }
    });
  };
}

const Simple: React.FC = observer(() => {
  const store = useLocalStore(() =>
    FieldGroup.create({
      children: {
        daddy: { value: 'baozi' },
        foo: { value: 'hello world' },
        bar: { value: 123 },
        baz: { value: undefined },
        namespaced: { value: true },
        parent: {
          children: {
            child: { value: 'child' }
          }
        },
        array: {
          children: [{ value: 'hello' }, { value: 'world' }]
        },
        barbar: {
          children: [
            {
              children: {
                is: {
                  value: 'your'
                }
              }
            },
            {
              children: {
                is: {
                  value: 'he'
                }
              }
            }
          ]
        }
      }
    })
  );

  useEffect(() => {
    (window as any).store = store;
  }, [store]);
  return (
    <div style={{ margin: '1rem' }}>
      <div>daddy: {decorate(store.children.get('daddy'))(<Input />)}</div>
      <div>
        <Button type="primary">提交</Button>
      </div>
      <div>
        <pre>fieldGroup:</pre>
        <pre>{JSON.stringify(store, null, 2)}</pre>
      </div>
      <div>
        <pre>value:</pre>
        <pre>{JSON.stringify(store.value, null, 2)}</pre>
      </div>
    </div>
  );
});

export default Simple;
