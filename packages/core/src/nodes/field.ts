import { types, Instance } from 'mobx-state-tree';

export const Field = types
  .model('Field', {
    initialValue: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    ),
    value: types.maybe(
      types.union(types.string, types.number, types.boolean, types.null)
    )
  })
  .actions(self => ({
    setValue(val?: string | number | boolean | null) {
      self.value = val === '' ? undefined : val;
    },
    setInitialValue(val?: string | number | boolean | null) {
      self.initialValue = val === '' ? undefined : val;
    }
  }))
  .actions(self => ({
    patchValue(val?: string | number | boolean | null) {
      self.setValue(val);
    },
    patchInitialValue(val?: string | number | boolean | null) {
      self.setInitialValue(val);
    },
    afterCreate() {
      self.setInitialValue(self.value);
    },
    async reset() {
      self.setValue(self.initialValue);
    },
    clear() {
      self.setValue(null);
    }
  }));

export type FieldInstance = Instance<typeof Field>;

export function createField(value?: string | number | boolean): FieldInstance {
  return Field.create({
    value
  });
}
