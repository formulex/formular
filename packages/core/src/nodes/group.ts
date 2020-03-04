import { types, IAnyModelType } from 'mobx-state-tree';
import { Field } from './field';
import { FieldArray } from './array';
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
      const result = {};
      for (const [key, node] of self.children.entries()) {
        Object.assign(result, { [key]: node.value });
      }
      return result;
    }
  }))
  .actions(self => {
    function _checkAllValuesPresent(val: any) {
      for (const name of self.children.keys()) {
        if (val[name] === undefined) {
          throw new Error(`Must supply a value for form field with name: '${name}'.`);
        }
      }
    }

    function _throwIfFieldMissing(name: string) {
      if (!self.children.size) {
        throw new Error('There are no form fields registered with this group yet.');
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
      patchValue(val: { [key: string]: any }) {
        Object.keys(val).forEach(name => {
          if (self.children.get(name)) {
            self.children.get(name).patchValue(val[name]);
          }
        });
      }
    };
  });
