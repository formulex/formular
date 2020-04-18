import { types, Instance, getRoot } from 'mobx-state-tree';
import { getIn } from '../utils';

export const Field = types
  .model('Field', {
    name: types.string,
    _value: types.frozen(),
    _fallbackInitialValue: types.frozen(),
    _everBlured: types.boolean,
    _everFocused: types.boolean
  })
  .views((self) => ({
    get _fallbackInitialValues(): any {
      return getRoot<any>(self)._fallbackInitialValues;
    }
  }))
  .actions((self) => ({
    setValue(val: any) {
      self._value = val;
    },
    setFallbackInitialValues(initialVal: any) {
      self._fallbackInitialValue = initialVal;
    }
  }))
  .views((self) => ({
    get value(): any {
      return self._value;
    },
    set value(val: any) {
      self.setValue(val);
    },
    get initialValue(): any {
      return (
        self._fallbackInitialValue ??
        getIn(self._fallbackInitialValues, self.name) ??
        undefined
      );
    },
    get touched(): boolean {
      return self._everBlured && self._everFocused;
    },
    get visited(): boolean {
      return self._everFocused;
    }
  }))
  .actions((self) => ({
    blur() {
      if (!self._everBlured) {
        self._everBlured = true;
      }
    },
    focus() {
      if (!self._everFocused) {
        self._everFocused = true;
      }
    },
    resetFlags() {
      self._everBlured = false;
      self._everFocused = false;
    }
  }));

export interface FieldConfig {
  name: string;
  initialValue?: any;
}

export type FieldInstance = Instance<typeof Field>;

export function createField({
  name,
  initialValue
}: FieldConfig): FieldInstance {
  const field = Field.create({
    name,
    _everBlured: false,
    _everFocused: false,
    _fallbackInitialValue: initialValue
  });

  return field;
}
