import { types, Instance, getType } from 'mobx-state-tree';
import { FieldInstance, createField } from '.';
import { IReactionDisposer, autorun } from 'mobx';
import { setIn } from '../utils';
import { SubscribeSetup, getResolvers } from '../sideEffect';
import { createValidationDecorator, FormDecorator } from '../decorators';
import { Field, FieldRegisterConfig } from './field';

const FormLifecycleHooks = types
  .model('FormLifecycleHooks', {})
  .actions(() => ({
    didRegisterField(_name: string, _field: FieldInstance) {},
    didUnregisterField(_name: string) {}
  }));

export const Form = types
  .compose(
    FormLifecycleHooks,
    types.model({
      _fallbackInitialValues: types.frozen(),
      fields: types.map(types.late(() => Field))
    })
  )
  .named('Form')
  .views((self) => ({
    get values(): { [key: string]: any } {
      let result: { [key: string]: any } = {};
      for (const [key, field] of self.fields.entries()) {
        result = { ...setIn(result, key, field.value) };
      }
      return result;
    },
    get initialValues(): { [key: string]: any } {
      let result: { [key: string]: any } = {};
      for (const [key, field] of self.fields.entries()) {
        result = { ...setIn(result, key, field.initialValue) };
      }
      return result;
    },
    resolve(name: string): FieldInstance | undefined {
      return self.fields.get(name);
    }
  }))
  .actions((self) => ({
    addField(name: string, field: FieldInstance) {
      self.fields.set(name, field);
    },
    removeField(name: string) {
      self.fields.delete(name);
    },
    setFallbackInitialValues(initialVal: any) {
      self._fallbackInitialValues = initialVal;
    }
  }))
  .actions((self) => ({
    registerField(
      name: string,
      effect?: (field: FieldInstance) => void,
      { initialValue, type }: FieldRegisterConfig = {}
    ): () => void {
      if (!self.fields.get(name)) {
        const field = createField({
          name,
          initialValue,
          type
        });
        self.addField(name, field);
      }
      let field = self.fields.get(name)!;
      setTimeout(() => {
        field.setValue(field.initialValue);
      });

      let disposer: null | IReactionDisposer = null;
      if (typeof effect === 'function') {
        disposer = autorun(() => effect(field), { name: `register:${name}` });
      }
      self.didRegisterField(name, field);
      return () => {
        disposer?.();
        self.removeField(name);
        self.didUnregisterField(name);
      };
    },
    initialize(data: object | ((values: object) => object)) {
      const values = typeof data === 'function' ? data(self.values) : data;
      self.setFallbackInitialValues(values);
      self.fields.forEach((field) => {
        field.setFallbackInitialValue(undefined);
        field.setValue(field.initialValue);
        field.resetFlags();
      });
    },
    subscribe(setup: SubscribeSetup): () => void {
      const disposers: (() => void)[] = [];
      if (typeof setup === 'function') {
        const gen = setup(
          getResolvers(self as FormInstance),
          self as FormInstance
        );

        for (const disposerOrNull of gen) {
          if (typeof disposerOrNull === 'function') {
            disposers.push(disposerOrNull);
          }
        }
      }
      return () => {
        for (const disposer of disposers) {
          disposer();
        }
      };
    },
    use(...decorators: FormDecorator[]): () => void {
      const undecorators: ReturnType<FormDecorator>[] = [];
      for (const decorator of decorators) {
        const undecorate = decorator(self as FormInstance);
        undecorators.push(undecorate);
      }
      return () => {
        for (const undecorate of undecorators) {
          undecorate?.();
        }
      };
    }
  }))
  .actions((self) => ({
    reset(initialValues: any = self.initialValues) {
      self.initialize(initialValues || {});
    }
  }));

export type FormInstance = Instance<typeof Form>;

export interface FormConfig<V> {
  onFinish?: (values: V) => any;
  initialValues?: V;
}

export function isFormInstance(o: any): o is FormInstance {
  return getType(o) === Form;
}

export function createForm<V = any>({
  initialValues
}: FormConfig<V>): FormInstance {
  const form = Form.create({
    _fallbackInitialValues: initialValues ? { ...initialValues } : {}
  });

  form.use(createValidationDecorator());

  return form;
}
