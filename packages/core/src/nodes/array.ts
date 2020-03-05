import { types, IAnyModelType, Instance } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup } from './group';
import { Field, createField } from './field';
import { dispatcher } from './helper';

export const FieldArray = types
  .model('FieldArray', {
    children: types.array(
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
      return [...self.children.values()].map(({ value }) => value);
    }
  }))
  .actions(self => {
    function _checkAllValuesPresent(val: any) {
      self.children.forEach((field, index) => {
        if (val[index] === undefined) {
          throw new Error(
            `Must supply a value for form field at index: ${index}.`
          );
        }
      });
    }

    function _throwIfFieldMissing(index: number) {
      if (!self.children.length) {
        throw new Error(
          'There are no form fields registered with this array yet.'
        );
      }
      if (!self.children[index]) {
        throw new Error(`Cannot find form field at index ${index}`);
      }
    }
    return {
      setValue(val: any[]) {
        _checkAllValuesPresent(val);
        val.forEach((newValue: any, index: number) => {
          _throwIfFieldMissing(index);
          self.children[index].setValue(newValue);
        });
      },
      patchValue(val: any[]) {
        val.forEach((newValue: any, index: number) => {
          if (self.children[index]) {
            self.children[index].patchValue(newValue);
          }
        });
      }
    };
  });

export type FieldArrayInstance = Instance<typeof FieldGroup>;

export function createFieldArray(value: any[]) {
  const children: any[] = [];
  value.forEach((target, index) => {
    const type = dispatcher({ children: target });
    if (type === FieldGroup) {
      children[index] = createFieldGroup(target);
    } else if (type === FieldArray) {
      children[index] = createFieldArray(target);
    } else {
      children[index] = createField(target);
    }
  });
  return FieldArray.create({ children });
}
