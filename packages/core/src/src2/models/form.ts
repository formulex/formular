import { types, Instance, getType } from 'mobx-state-tree';
import { Field, FieldConfig, FieldInstance, createField } from './field';
import { IReactionDisposer, autorun } from 'mobx';
import { setIn } from '../utils';
import { Setup, ResolverContextManager, getResolvers } from '../sideEffect';

export interface FieldRegisterConfig extends Omit<FieldConfig, 'name'> {}

export const Form = types
  .model('Form', {
    _fallbackInitialValues: types.frozen(),
    fields: types.map(types.late(() => Field))
  })
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
  .volatile(() => ({
    disposers: [] as IReactionDisposer[]
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
      field.setValue(field.initialValue);

      let disposer: null | IReactionDisposer = null;
      if (typeof effect === 'function') {
        disposer = autorun(() => effect(field), { name: `register:${name}` });
      }

      return () => {
        disposer?.();
        self.removeField(name);
      };
    },
    async validate() {},
    initialize(data: object | ((values: object) => object)) {
      const values = typeof data === 'function' ? data(self.values) : data;
      self.setFallbackInitialValues(values);
      self.fields.forEach((field) => {
        field.setFallbackInitialValue(undefined);
        field.setValue(field.initialValue);
        field.resetFlags();
      });
    },
    subscribe(setup: Setup): () => void {
      if (typeof setup === 'function') {
        ResolverContextManager.push({ disposers: self.disposers });
        setup(getResolvers(self as FormInstance));
        ResolverContextManager.pop();
      }
      return () => {
        console.log('begin setup dispose');
        for (const disposer of self.disposers) {
          disposer();
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

  return form;
}
