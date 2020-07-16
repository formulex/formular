import { getParentOfType, getType, Instance, types } from 'mobx-state-tree';
import { getIn } from '../../utils';
import { Form } from '../form';
import {
  FeatureShow,
  FeatureDisabled,
  FeatureLoading,
  FeatureStateFlags,
  FeatureEnum,
  FeatureValidation,
  FeatureFrozenState,
  FeatureHotState,
  FeatureCollection,
  createValidation,
  CreateValidationOptions
} from './inner-features';

const Features = types.compose(
  FeatureShow,
  FeatureDisabled,
  FeatureLoading,
  FeatureStateFlags,
  FeatureEnum,
  FeatureValidation,
  FeatureFrozenState,
  FeatureHotState,
  FeatureCollection
);

export const Field = types
  .compose(
    Features,
    types.model({
      name: types.string
    })
  )
  .actions((self) => ({
    __rename(name: string) {
      self.name = name;
    },
    __changeBeat() {
      // noop
    },
    change(val: any) {
      getParentOfType(self, Form).change(self.name, val);
    }
  }))
  .views((self) => {
    return {
      get value(): any {
        return getIn(getParentOfType(self, Form).values, self.name);
      },
      get initialValue(): any {
        return getIn(getParentOfType(self, Form).initialValues, self.name);
      }
    };
  })
  // .actions((self) => ({
  //   toArray() {
  //     self._value = [self.value];
  //   },
  //   push(val?: any) {
  //     if (!Array.isArray(self.value)) {
  //       throw new Error(
  //         `Cannot use "push" action since the value of "${self.name}" is NOT an array. Try to use field(...).toArray() to convert.`
  //       );
  //     }
  //     self._value = [...self.value, val];
  //   },
  //   pop() {
  //     if (!Array.isArray(self.value)) {
  //       throw new Error(
  //         `Cannot use "pop" action since the value of "${self.name}" is NOT an array. Try to use field(...).toArray() to convert.`
  //       );
  //     }
  //     if (!self.value.length) {
  //       return [];
  //     }
  //     const removedIndex = self.value.length - 1;

  //     const clone = [...self.value];
  //     const result = clone.pop();

  //     self._value = clone;
  //     if (removedIndex) {
  //       const pattern = new RegExp(
  //         `^${escapeRegexTokens(self.name)}\\[${removedIndex}].*`
  //       );
  //       const form = getParentOfType(self, Form);
  //       for (const key of form.fields.keys()) {
  //         if (pattern.test(key)) {
  //           form.removeField(key);
  //         }
  //       }
  //     }

  //     return result;
  //   },
  //   remove(index: number) {
  //     if (!Array.isArray(self.value)) {
  //       throw new Error(
  //         `Cannot use "remove" action since the value of "${self.name}" is NOT an array. Try to use field(...).toArray() to convert.`
  //       );
  //     }
  //     const clone = [...self.value];
  //     const returnValue = clone[index];
  //     clone.splice(index, 1);
  //     self._value = clone;

  //     const pattern = new RegExp(
  //       `^${escapeRegexTokens(self.name)}\\[(\\d+)\\](.*)`
  //     );
  //     const form = getParentOfType(self, Form);
  //     for (const key of [...form.fields.keys()]) {
  //       const tokens = pattern.exec(key);
  //       if (tokens) {
  //         const fieldIndex = Number(tokens[1]);
  //         if (fieldIndex === index) {
  //           // delete any subfields for this array item
  //           form.removeField(key);
  //         } else if (fieldIndex > index) {
  //           // shift all higher ones down
  //           const decrementedKey = `${self.name}[${fieldIndex - 1}]${
  //             tokens[2]
  //           }`;
  //           form.renameField(key, decrementedKey);
  //         }
  //       }
  //     }

  //     return returnValue;
  //   }
  // }))
  // .actions((self) => ({
  //   runInAction(debugName: string, action: (this: typeof self) => any) {
  //     action.call(self);
  //   }
  // }))
  .named('Field');

type FieldDesignType = typeof Field;
export interface FieldDesignInterface extends FieldDesignType {}

export interface FieldConfig extends CreateValidationOptions {
  name: string;
}

export interface FieldRegisterConfig extends Omit<FieldConfig, 'name'> {
  initialValue?: any;
  perishable?: boolean;
}

export interface FieldInstance extends Instance<FieldDesignInterface> {}

export function isFieldInstance(o: any): o is FieldInstance {
  return getType(o) === Field;
}

export function createField({
  name,
  validateFirst,
  validateTrigger,
  rule,
  messageVariables,
  validateMessages
}: FieldConfig): FieldInstance {
  return Field.create({
    name,
    _everBlured: false,
    _everFocused: false,
    _show: true,
    _disabled: undefined,
    _loading: undefined,
    active: false,
    _ignored: false,
    modified: false,
    _plain: undefined,
    validation: createValidation({
      validateFirst,
      validateTrigger,
      rule,
      messageVariables,
      validateMessages
    }),
    _frozenState: {}
  });
}
