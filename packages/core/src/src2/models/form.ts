import { types, Instance, getType } from 'mobx-state-tree';
import { Field, FieldConfig, FieldInstance, createField } from './field';
import { untracked, IReactionDisposer, autorun } from 'mobx';

interface FormValuesBase {
  [key: string]: any;
}

interface FieldRegisterConfig extends Omit<FieldConfig, 'name'> {
  silent?: boolean;
}

export const Form = types
  .model('Form', {
    _fallbackInitialValues: types.frozen<FormValuesBase>(),
    fields: types.map(Field)
  })
  .views((self) => ({
    get values(): { [key: string]: any } {
      const result: { [key: string]: any } = {};
      for (const [key, field] of self.fields.entries()) {
        result[key] = field.value;
      }
      return result;
    },
    get initialValues(): { [key: string]: any } {
      const result: { [key: string]: any } = {};
      for (const [key, field] of self.fields.entries()) {
        result[key] = field.initialValue;
      }
      return {};
    },
    field(name: string): FieldInstance | undefined {
      return self.fields.get(name);
    }
  }))
  .actions((self) => ({
    addField(name: string, field: FieldInstance) {
      self.fields.set(name, field);
    },
    setFallbackInitialValues(initialVal: any) {
      self._fallbackInitialValues = initialVal;
    }
  }))
  .actions((self) => ({
    registerField(
      name: string,
      effect?: (field: FieldInstance) => void,
      { silent = false, initialValue }: FieldRegisterConfig = {}
    ): () => void {
      function register() {
        if (!self.fields.get(name)) {
          const field = createField({
            name,
            initialValue
          });
          self.addField(name, field);
        }
        let field = self.fields.get(name)!;

        return field;
      }

      let field = silent ? untracked(() => register()) : register();

      let disposer: null | IReactionDisposer = null;
      if (typeof effect === 'function') {
        disposer = autorun(() => effect(field), { name: `register:${name}` });
      }

      return () => {
        disposer?.();
      };
    },
    async validate() {}
  }));

export type FormInstance = Instance<typeof Form>;

export interface FormConfig<V extends FormValuesBase> {
  onFinish: (values: V) => any;
  initialValues?: V;
}

export function isFormInstance(o: any): o is FormInstance {
  return getType(o) === Form;
}

export function createForm<V extends FormValuesBase = FormValuesBase>({
  initialValues
}: FormConfig<V>): FormInstance {
  const form = Form.create({
    _fallbackInitialValues: initialValues ? { ...initialValues } : {}
  });

  return form;
}
