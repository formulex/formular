import { types, Instance, flow } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup, FieldGroupInstance } from './group';
import { FieldInstance } from './field';
import { FieldArrayInstance } from './array';
import { getOrCreateNodeFromBase } from './helper';
import { Validators, enUS } from '../validation';
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
    _validateMessages: types.map(types.string),
    _initialValues: types.frozen()
  })
  .views((self) => ({
    get validateMessages() {
      return self._validateMessages.toJSON();
    },
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
      const { node } = getOrCreateNodeFromBase(name, {
        ...config,
        base: self.root
      });
      return node;
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
  initialValues: _initialValues = {},
  localValidatorPresets = {},
  validateStrategy = 'all',
  asyncValidateStrategy = 'parallel',
  validateTiming = 'change',
  validateMessages: _validateMessages = enUS
}: CreateFormOptions<Values>): FormInstance {
  const root = createFieldGroup({});

  const validators = new Validators();
  Object.keys(localValidatorPresets).forEach((name) => {
    const validator = localValidatorPresets[name];
    validators.registerValidator(name, validator);
  });

  // fixme: debug for "walk" method in "mobx-state-tree"
  // see https://github.com/mobxjs/mobx-state-tree/issues/1433
  !root.value;
  !root.initialValue;
  const form = Form.create(
    {
      root,
      isSubmitting: false,
      uid: `Form:${uid()}`,
      validateStrategy,
      asyncValidateStrategy,
      validateTiming,
      _validateMessages,
      _initialValues
    },
    { validators } as FormEnvironment
  );
  return form;
}
