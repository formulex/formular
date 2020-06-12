import { getType, Instance, types, flow, detach } from 'mobx-state-tree';
import { createField, FieldInstance } from '../';
import { autorun, IReactionDisposer, runInAction, transaction } from 'mobx';
import { setIn, getIn } from '../../utils';
import { getResolvers, SubscribeSetup } from '../../sideEffect';
import type { FormFeature } from '../../features';
import { Field, FieldRegisterConfig, FieldDesignInterface } from '../field';
import type { CreateValidationFeatureOptions } from '../../features/validation';
import { createAjv } from '../../features/validation';
import ajvErrors from 'ajv-errors';
import { Ajv } from 'ajv';
import { FeatureCollection } from './inner-features';

const FormLifecycleHooks = types
  .model('FormLifecycleHooks', {})
  .actions(() => ({
    didRegisterField(_name: string, _field: FieldInstance) {},
    didUnregisterField(_name: string) {}
  }));

export const Form = types
  .compose(
    FormLifecycleHooks,
    FeatureCollection,
    types.model({
      _fallbackInitialValues: types.frozen(),
      fields: types.map(types.late((): FieldDesignInterface => Field)),
      validating: types.boolean,
      everValitated: types.boolean
    })
  )

  .views((self) => ({
    get values(): { [key: string]: any } {
      let result: { [key: string]: any } = {};
      for (const [key, field] of self.fields.entries()) {
        if (field.ignored === false) {
          result = { ...setIn(result, key, field.value) };
        }
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
    renameField(name: string, to: string) {
      const target = self.fields.get(name);
      if (target) {
        const field = detach(target);
        field.__rename(to);
        self.fields.set(to, field);
      }
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
      const field = self.fields.get(name)!;
      setTimeout(() => {
        runInAction('innerSetValue', () => {
          if (field.initialValue !== undefined) {
            field.setValueSilently(field.initialValue);
          }
        });
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
    initialize(
      data: object | ((values: object) => object),
      filter: (field: FieldInstance) => boolean
    ) {
      const values = typeof data === 'function' ? data(self.values) : data;
      self.setFallbackInitialValues(values);
      self.fields.forEach((field) => {
        field.setFallbackInitialValue(getIn(values, field.name));
        if (filter(field)) {
          setTimeout(() => {
            transaction(() => {
              field.setValueSilently(field.initialValue);
              field.resetFlags();
            });
          });
        }
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
    use(...decorators: FormFeature[]): () => void {
      const undecorators: ReturnType<FormFeature>[] = [];
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
      self.initialize(initialValues || {}, () => true);
      self.everValitated = false;
    },
    resetFields(names?: string[]) {
      self.initialize(self.initialValues || {}, (field) =>
        Array.isArray(names) ? names.includes(field.name) : true
      );
      self.everValitated = false;
    },
    forceResetFields(names?: string[]) {
      self.initialize({}, (field) =>
        Array.isArray(names) ? names.includes(field.name) : true
      );
      self.everValitated = false;
    },
    validate: flow(function* validate({
      abortEarly = false
    }: FormValidateCallOptions = {}) {
      if (!self.everValitated) {
        self.everValitated = true;
      }
      if (self.validating) {
        return;
      }
      const syncErrors: Array<{ name: string; messages: string[] }> = [];
      for (const field of self.fields.values()) {
        if (field.ignored === false) {
          yield field.validation.validate({
            sync: true,
            async: false,
            noPending: true
          });
          if (field.validation.status === 'INVALID') {
            syncErrors.push({
              name: field.name,
              messages: [...field.validation.syncMessages]
            });
            if (abortEarly) {
              return syncErrors;
            }
          }
        }
      }
      if (syncErrors.length) {
        return syncErrors;
      }
      const asyncErrors: Array<{ name: string; messages: string[] }> = [];
      self.validating = true;
      const errors = yield Promise.all(
        [...self.fields.values()].map((field) =>
          field.validation
            .validate({ sync: false, async: true, noPending: true })
            .then(() => {
              if (field.validation.status === 'INVALID') {
                asyncErrors.push({
                  name: field.name,
                  messages: [...field.validation.asyncMessages]
                });
                if (abortEarly) {
                  return Promise.reject(asyncErrors);
                }
              }
            })
        )
      ).then(
        () => null,
        (errors: Array<{ name: string; messages: string[] }>) => errors
      );
      if (Array.isArray(errors)) {
        self.validating = false;
        return errors;
      }
      self.validating = false;
      if (asyncErrors.length) {
        return asyncErrors;
      }
    })
  }))
  .actions((self) => ({
    runInAction(debugName: string, action: (this: typeof self) => any) {
      action.call(self);
    }
  }))
  .named('Form');

type FormDesignType = typeof Form;
export interface FormDesignInterface extends FormDesignType {}

export interface FormInstance extends Instance<FormDesignInterface> {}

export interface FormValidateCallOptions {
  abortEarly?: boolean;
}

export interface FormConfig<V> extends CreateValidationFeatureOptions {
  onFinish?: (values: V) => any;
  onFinishFailed?: (errors: Array<{ name: string; messages: string[] }>) => any;
  initialValues?: V;
}

export interface FormEnvironment {
  ajv: Ajv;
}

export function isFormInstance(o: any): o is FormInstance {
  return getType(o) === Form;
}

export function createForm<V = any>({
  initialValues
}: Pick<FormConfig<V>, 'initialValues'>): FormInstance {
  const ajv = createAjv();
  ajvErrors(ajv);
  const form = Form.create(
    {
      _fallbackInitialValues: initialValues ? { ...initialValues } : {},
      validating: false,
      everValitated: false,
      _plain: false
    },
    { ajv }
  );

  return form;
}
