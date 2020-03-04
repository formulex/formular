import {
  types,
  onSnapshot,
  getRoot,
  getPath,
  getRelativePath,
  getType,
  getParent,
  getParentOfType,
  tryResolve
} from 'mobx-state-tree';
import { ITypeDispatcher } from 'mobx-state-tree/dist/internal';
import { FieldGroup, FieldArray } from '../../src/nodes';

const base = FieldGroup.create({
  children: {
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
});

onSnapshot(base, snapshot => {
  console.log('snapshot', snapshot);
});

console.log(JSON.stringify(base, null, 2));

const node1 = base.children.get('foo');
const node2 = base.children.get('barbar').children.get(0);
const node3 = base.children.get('parent').children.get('child');

console.log(getRoot(node1), getRoot(node1) === base, node2);

console.log(
  getType(getParentOfType(node3, types.union(FieldArray, FieldGroup))),
  getRelativePath(node1, node2)
);

console.log(
  'resolved',
  tryResolve(base, '/children/barbar/children/1/children/is'),
  getRelativePath(base, node1)
);

(window as any).base = base;
