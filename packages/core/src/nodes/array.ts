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
  .views((self) => ({
    get results() {
      const result: any[] = [];
      for (const r of self.children.values()) {
        if (r) {
          result.push(r);
        }
      }
      return result.length ? result : null;
    },
    get value() {
      return [...self.children.values()].map(({ value }) => value);
    },
    get initialValue() {
      return [...self.children.values()].map(
        ({ initialValue }) => initialValue
      );
    }
  }))
  .actions((self) => {
    function _checkAllValuesPresent(val: any) {
      self.children.forEach((field, index) => {
        if (!Object.prototype.hasOwnProperty.call(val, index)) {
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
      setInitialValue(val: any[]) {
        _checkAllValuesPresent(val);
        val.forEach((newValue: any, index: number) => {
          _throwIfFieldMissing(index);
          self.children[index].setInitialValue(newValue);
        });
      },
      patchValue(val: any[]) {
        val.forEach((newValue: any, index: number) => {
          if (self.children[index]) {
            self.children[index].patchValue(newValue);
          }
        });
      },
      patchInitialValue(val: any[]) {
        val.forEach((newValue: any, index: number) => {
          if (self.children[index]) {
            self.children[index].patchInitialValue(newValue);
          }
        });
      },
      addChild(name: string | number, val: any) {
        let index: number =
          typeof name === 'string' ? Number.parseInt(name) : name;
        self.children[index] = val;
      }
    };
  })
  .actions((self) => {
    return {
      afterCreate() {
        self.setInitialValue(self.value);
      },
      async reset() {
        self.setValue(self.initialValue);
      },
      clear() {
        self.children.clear();
      },
      async validate(): Promise<void> {
        await Promise.all(
          [...self.children.values()].map((node) => node.validate())
        );
      }
    };
  });

export type FieldArrayInstance = Instance<typeof FieldArray>;

export function createFieldArray(value: any[]): FieldArrayInstance {
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
