import { types, IAnyModelType, Instance } from 'mobx-state-tree';
import { Field, createField } from './field';
import { FieldArray, createFieldArray } from './array';
import { dispatcher } from './helper';

export const FieldGroup = types
  .model('FieldGroup', {
    children: types.map(
      types.union(
        { dispatcher },
        Field,
        types.late((): IAnyModelType => FieldGroup),
        types.late((): IAnyModelType => FieldArray)
      )
    )
  })
  .views(self => ({
    get value() {
      const result: { [key: string]: any } = {};
      for (const [key, node] of self.children.entries()) {
        result[key] = node.value;
      }
      return result;
    },
    get initialValue() {
      const result: { [key: string]: any } = {};
      for (const [key, node] of self.children.entries()) {
        result[key] = node.initialValue;
      }
      return result;
    }
  }))
  .actions(self => {
    function _checkAllValuesPresent(val: object) {
      for (const name of self.children.keys()) {
        if (!Object.prototype.hasOwnProperty.call(val, name)) {
          throw new Error(
            `Must supply a value for form field with name: '${name}'.`
          );
        }
      }
    }

    function _throwIfFieldMissing(name: string) {
      if (!self.children.size) {
        throw new Error(
          'There are no form fields registered with this group yet.'
        );
      }
      if (!self.children.get(name)) {
        throw new Error(`Cannot find form field with name: ${name}.`);
      }
    }

    return {
      setValue(val: { [key: string]: any }) {
        _checkAllValuesPresent(val);
        Object.keys(val).forEach(name => {
          _throwIfFieldMissing(name);
          self.children.get(name).setValue(val[name]);
        });
      },
      setInitialValue(val: { [key: string]: any }) {
        _checkAllValuesPresent(val);
        Object.keys(val).forEach(name => {
          _throwIfFieldMissing(name);
          self.children.get(name).setInitialValue(val[name]);
        });
      },
      patchValue(val: { [key: string]: any }) {
        Object.keys(val).forEach(name => {
          if (self.children.get(name)) {
            self.children.get(name).patchValue(val[name]);
          }
        });
      },
      patchInitialValue(val: { [key: string]: any }) {
        Object.keys(val).forEach(name => {
          if (self.children.get(name)) {
            self.children.get(name).patchInitialValue(val[name]);
          }
        });
      },
      addChild(name: string, val: any) {
        self.children.set(name, val);
      }
    };
  })
  .actions(self => {
    return {
      afterCreate() {
        self.setInitialValue(self.value);
      },
      reset() {
        self.setValue(self.initialValue);
      },
      clear() {
        for (const node of self.children.values()) {
          node.clear();
        }
      }
    };
  });

export type FieldGroupInstance = Instance<typeof FieldGroup>;

export function createFieldGroup(value: {
  [key: string]: any;
}): FieldGroupInstance {
  const children = {};
  Object.keys(value).forEach(name => {
    const target = value[name];
    const type = dispatcher({ children: target });
    if (type === FieldGroup) {
      Object.assign(children, { [name]: createFieldGroup(target) });
    } else if (type === FieldArray) {
      Object.assign(children, { [name]: createFieldArray(target) });
    } else {
      Object.assign(children, { [name]: createField(target) });
    }
  });
  return FieldGroup.create({ children });
}
