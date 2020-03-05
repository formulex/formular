import { types, Instance } from 'mobx-state-tree';

export const Field = types
  .model('Field', {
    value: types.maybe(types.union(types.string, types.number, types.boolean))
  })
  .actions(self => ({
    setValue(val?: string | number | boolean) {
      self.value = val === '' ? undefined : val;
    }
  }))
  .actions(self => ({
    patchValue(val?: string | number | boolean) {
      self.setValue(val);
    }
  }));

export type FieldInstance = Instance<typeof Field>;

export function createField(value?: string | number | boolean): FieldInstance {
  return Field.create({
    value
  });
}
