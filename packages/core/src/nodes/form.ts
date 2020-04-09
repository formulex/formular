import { types, Instance, flow } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup, FieldGroupInstance } from './group';
import { FieldInstance } from './field';
import { FieldArrayInstance } from './array';
import { getOrCreateNodeFromBase } from './helper';
import { Validators } from '../validation';
import {
  ValidatorOrValidatorFactory,
  ValidateStrategy,
  AsyncValidateStrategy
} from '../validation/types';
import { uid } from '../utils/uid';

export const Form = types
  .model('Form', {
    root: FieldGroup,
    isSubmitting: types.boolean,
    uid: types.string,
    validateStrategy: types.enumeration<ValidateStrategy>('validateStrategy', [
      'all',
      'bail'
    ]),
    asyncValidateStrategy: types.enumeration<AsyncValidateStrategy>(
      'asyncValidateStrategy',
      ['parallel', 'parallelBail', 'series', 'seriesBail']
    ),
    validateTiming: types.union(
      types.literal('blur'),
      types.literal('change'),
      types.frozen<['change', number]>()
    ),
    validateMessages: types.map(types.string)
  })
  .views((self) => ({
    get value() {
      return self.root.value;
    },
    get initialValue() {
      return self.root.initialValue;
    },
    get clear() {
      return self.root.clear;
    },
    get reset() {
      return self.root.reset;
    }
  }))
  .actions((self) => ({
    submit: flow<{ [key: string]: any }, []>(function* submit() {
      self.isSubmitting = true;
      yield new Promise((r) => setTimeout(r, 500));
      self.isSubmitting = false;
      return self.root.value;
    }),
    registerField(
      name: string,
      config: {
        initialValue: any;
        type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
      } = {
        type: undefined,
        initialValue: undefined
      }
    ): FieldInstance | FieldGroupInstance | FieldArrayInstance {
      return getOrCreateNodeFromBase(name, {
        ...config,
        base: self.root
      });
    },
    async validateFields() {
      await self.root.validate();
      return self.root.results;
    },
    setFormValidateStrategy(strategy: ValidateStrategy) {
      self.validateStrategy = strategy;
    },
    setFormAsyncValidateStrategy(strategy: AsyncValidateStrategy) {
      self.asyncValidateStrategy = strategy;
    }
  }));

export type FormInstance = Instance<typeof Form>;

export interface CreateFormOptions<Values> {
  initialValues?: Partial<Values>;
  values?: Partial<Values>;
  localValidatorPresets?: { [name: string]: ValidatorOrValidatorFactory };
  validateStrategy?: ValidateStrategy;
  asyncValidateStrategy?: AsyncValidateStrategy;
  validateTiming?: 'blur' | 'change' | ['change', number];
  validateMessages?: { [key: string]: string };
}

export interface FormEnvironment {
  validators: Validators;
}

export function createForm<Values = any>({
  initialValues = {},
  values = {},
  localValidatorPresets = {},
  validateStrategy = 'all',
  asyncValidateStrategy = 'parallel',
  validateTiming = 'change',
  validateMessages = {}
}: CreateFormOptions<Values>): FormInstance {
  const root = createFieldGroup(initialValues);

  const validators = new Validators();
  Object.keys(localValidatorPresets).forEach((name) => {
    const validator = localValidatorPresets[name];
    validators.registerValidator(name, validator);
  });

  // fixme: debug for "walk" method in "mobx-state-tree"
  // see https://github.com/mobxjs/mobx-state-tree/issues/1433
  !root.value;
  !root.initialValue;
  root.patchValue(values);
  return Form.create(
    {
      root,
      isSubmitting: false,
      uid: `Form:${uid()}`,
      validateStrategy,
      asyncValidateStrategy,
      validateTiming,
      validateMessages
    },
    { validators } as FormEnvironment
  );
}
