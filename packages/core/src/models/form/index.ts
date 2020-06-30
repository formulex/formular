import { getType, Instance, types, flow, detach } from 'mobx-state-tree';
import { createField, FieldInstance } from '../';
import {
  autorun,
  IReactionDisposer,
  transaction,
  observable,
  toJS
} from 'mobx';
import { setIn, getIn, changeValue } from '../../utils';
import { getResolvers, SubscribeSetup } from '../../sideEffect';
import type { FormFeature } from '../../features';
import { Field, FieldRegisterConfig, FieldDesignInterface } from '../field';
import type { CreateValidationFeatureOptions } from '../../features/validation';
import { createAjv } from '../../features/validation';
import ajvErrors from 'ajv-errors';
import { Ajv } from 'ajv';
import { FeatureCollection } from './inner-features';
import set from 'lodash.set';

export const Form = types
  .compose(
    FeatureCollection,
    types.model({
      fields: types.map(types.late((): FieldDesignInterface => Field)),
      validating: types.boolean,
      everValitated: types.boolean,
      // Immutable 🧊 Form InitialValues Source
      immInitialValues: types.frozen()
    })
  )
  .volatile((self) => ({
    // Reactive ✨ Form Values Source
    xValues: observable(
      self.immInitialValues ? { ...self.immInitialValues } : {},
      {},
      { name: '✨ Form Values Source' }
    ),
    resolve(name: string): FieldInstance | undefined {
      return self.fields.get(name);
    }
  }))
  .views((self) => ({
    get values(): { [key: string]: any } {
      return toJS(self.xValues);
    },
    get initialValues(): { [key: string]: any } {
      return { ...self.immInitialValues };
    }
  }))
  .actions((self) => ({
    change(name: string, value: any): void {
      if (getIn(self.values, name) !== value) {
        changeValue(self.xValues, name, value);
        self.resolve(name)?.markModified(true);
      }
    },
    blur(name: string): void {
      self.resolve(name)?.blur();
    },
    focus(name: string): void {
      self.resolve(name)?.focus();
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
      const target = self.resolve(name);
      if (target) {
        const field = detach(target);
        field.__rename(to);
        self.fields.set(to, field);
      }
    }
  }))
  .actions((self) => ({
    registerField(
      name: string,
      effect?: (field: FieldInstance) => void,
      { initialValue }: FieldRegisterConfig = {}
    ): () => void {
      let field = self.fields.get(name);
      if (!field) {
        field = createField({
          name,
          initialValue
        });
        self.fields.set(name, field);
      }
      if (
        initialValue !== undefined &&
        getIn(self.values, name) === undefined
        // only initialize if we don't yet have any value for this field
      ) {
        self.immInitialValues = setIn(
          self.immInitialValues,
          name,
          initialValue
        );

        set(self.xValues, name, initialValue);
      }

      let disposer: null | IReactionDisposer = null;
      if (typeof effect === 'function') {
        disposer = autorun(() => effect(field!), { name: `register:${name}` });
      }
      return () => {
        disposer?.();
        self.fields.delete(name);
      };
    },
    initialize(
      data: object | ((values: object) => object),
      filter: (field: FieldInstance) => boolean
    ) {
      const values = typeof data === 'function' ? data(self.values) : data;
      self.immInitialValues = { ...values };
      self.fields.forEach((field) => {
        field.setFallbackInitialValue(getIn(values, field.name));
      });
      setTimeout(() => {
        transaction(() => {
          self.fields.forEach((field) => {
            if (filter(field)) {
              field.setValueSilently(field.initialValue);
              field.resetFlags();
              field.validation.resetValidationFlags();
            }
          });
        });
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
          } else if (
            typeof (disposerOrNull as any)?.unsubscribe === 'function'
          ) {
            disposers.push((disposerOrNull as any).unsubscribe);
          }
        }
      }
      return () => {
        for (const disposer of disposers) {
          disposer?.();
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
    validateFields: flow(function* validate({
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
            .validate({ sync: false, async: true, noPending: false })
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
      immInitialValues: initialValues && { ...initialValues },
      validating: false,
      everValitated: false,
      _plain: false
    },
    { ajv }
  );

  return form;
}
