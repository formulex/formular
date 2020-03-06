import { types, Instance } from 'mobx-state-tree';

export const Field = types
  .model('Field', {
    initialValue: types.maybe(
      types.union(types.string, types.number, types.boolean)
    ),
    value: types.maybe(types.union(types.string, types.number, types.boolean))
  })
  .actions(self => ({
    setValue(val?: string | number | boolean) {
      self.value = val === '' ? undefined : val;
    },
    setInitialValue(val?: string | number | boolean) {
      self.initialValue = val === '' ? undefined : val;
    }
  }))
  .actions(self => ({
    patchValue(val?: string | number | boolean) {
      self.setValue(val);
    },
    patchInitialValue(val?: string | number | boolean) {
      self.setInitialValue(val);
    },
    afterCreate() {
      self.setInitialValue(self.value);
    },
    reset() {
      self.setValue(self.initialValue);
    },
    clear() {
      self.setValue(undefined);
    }
  }));

export type FieldInstance = Instance<typeof Field>;

export function createField(value?: string | number | boolean): FieldInstance {
  return Field.create({
    value
  });
}
