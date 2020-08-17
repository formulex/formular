import { getParentOfType, getType, Instance, types } from 'mobx-state-tree';
import { getIn } from '../../utils';
import { Form, MutationFn, ValueType } from '../form';
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

export interface ChangeFn {
  (value: MutationFn | ValueType): void;
}

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
    change(val: MutationFn | ValueType) {
      getParentOfType(self, Form).change(self.name, val);
    }
  }))
  .views((self) => {
    return {
      get value(): any {
        return getIn(getParentOfType(self, Form).xValues, self.name);
      },
      get initialValue(): any {
        return getIn(getParentOfType(self, Form).immInitialValues, self.name);
      }
    };
  })
  .named('Field');

type FieldDesignType = typeof Field;
export interface FieldDesignInterface extends FieldDesignType {}

export interface FieldConfig extends CreateValidationOptions {
  name: string;

  // set props
  show?: boolean;
  disabled?: boolean;
  ignored?: boolean;
  plain?: boolean;
  enum?: Record<string, any>[];
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
  validateMessages,
  show,
  disabled,
  ignored,
  plain,
  enum: enums
}: FieldConfig): FieldInstance {
  const result = Field.create({
    name,
    _everBlured: false,
    _everFocused: false,
    _show: show ?? true,
    _disabled: disabled ?? undefined,
    _loading: undefined,
    active: false,
    _ignored: ignored ?? false,
    modified: false,
    _plain: plain ?? undefined,
    validation: createValidation({
      validateFirst,
      validateTrigger,
      rule,
      messageVariables,
      validateMessages
    }),
    _frozenState: {},
    _enum: enums ?? []
  });

  return result;
}
