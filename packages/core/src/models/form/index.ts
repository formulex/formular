import { getType, Instance, types, flow, clone } from 'mobx-state-tree';
import { createField, FieldInstance } from '../';
import { transaction, observable, toJS } from 'mobx';
import { setIn, getIn, changeValue } from '../../utils';
import { getResolvers, SubscribeSetup, SubscribeArgs } from '../../sideEffect';
import { Field, FieldRegisterConfig, FieldDesignInterface } from '../field';
import type { CreateValidationFeatureOptions } from '../../features/validation';
import { createAjv } from '../../features/validation';
import ajvErrors from 'ajv-errors';
import { Ajv } from 'ajv';
import { FeatureCollection } from './inner-features';

export const Form = types
  .compose(
    FeatureCollection,
    types.model({
      fields: types.map(types.late((): FieldDesignInterface => Field)),
      validating: types.boolean,
      everValitated: types.boolean,
      // Immutable 🧊 Form InitialValues Source
      immInitialValues: types.frozen(),

      // extra vars when generate error string
      _messageVariables: types.maybe(types.frozen()),
      _validateMessages: types.maybe(types.frozen())
    })
  )
  .volatile((self) => ({
    // Reactive ✨ Form Values Source
    xValues: observable(
      self.immInitialValues ? { ...self.immInitialValues } : {}
    ),
    resolve(name: string): FieldInstance | undefined {
      return self.fields.get(name);
    },
    fieldsEffects: observable.map<string, (field: FieldInstance) => () => void>(
      {}
    ),
    fieldsDisposers: observable.map<string, () => void>({})
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
    changeSiliently(name: string, value: any): void {
      if (getIn(self.values, name) !== value) {
        changeValue(self.xValues, name, value);
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
    removeField(name: string) {
      self.fields.delete(name);
    }
  }))
  .actions((self) => {
    function getSetupRunner<Args>(args: Args) {
      return function subscribe(setup: SubscribeSetup<Args>): () => void {
        const disposers: (() => void)[] = [];
        if (typeof setup === 'function') {
          const gen = setup(args);

          if (typeof gen === 'function') {
            // gen is with type () => void
            disposers.push(gen);
          } else if (gen === undefined || gen === null) {
            // ignore
          } else {
            // gen is generator
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
        }
        return () => {
          for (const disposer of disposers) {
            disposer?.();
          }
        };
      };
    }
    return {
      renameField(name: string, to: string) {
        const field = self.resolve(name);
        if (field) {
          const cloned = clone(field);
          cloned.validation.setRules([...field.validation.rules]);
          cloned.__rename(to);
          self.fields.set(to, cloned);
          self.fields.delete(name);
          const effect = self.fieldsEffects.get(name);
          if (effect) {
            self.fieldsEffects.set(to, effect);
            self.fieldsEffects.delete(name);
          }

          const disposer = self.fieldsDisposers.get(name);
          const newEffect = self.fieldsEffects.get(to);
          if (typeof disposer === 'function' && newEffect) {
            disposer();
            self.fieldsDisposers.set(
              to,
              getSetupRunner<FieldInstance>(cloned!)(newEffect)
            );
            self.fieldsDisposers.delete(name);
          }

          const value = getIn(self.values, name);
          self.changeSiliently(name, undefined);
          self.changeSiliently(to, value);
        }
      },
      registerField(
        name: string,
        effect?: (field: FieldInstance) => () => void,
        {
          initialValue,
          validateFirst,
          validateTrigger,
          rule,
          messageVariables,
          validateMessages
        }: FieldRegisterConfig = {}
      ): () => void {
        let field = self.fields.get(name);
        if (!field) {
          field = createField({
            name,
            validateFirst,
            validateTrigger,
            rule,
            messageVariables,
            validateMessages
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

          self.changeSiliently(name, initialValue);
        }

        if (typeof effect === 'function') {
          self.fieldsEffects.set(name, effect);
          const disposer = getSetupRunner<FieldInstance>(field!)(effect);
          self.fieldsDisposers.set(name, disposer);
        }

        field.validation.validateRules();

        return () => {
          self.fieldsDisposers.get(name)?.();
          self.fieldsDisposers.delete(name);
          self.fieldsEffects.delete(name);
          self.removeField(name);
        };
      },
      initialize(
        data: object | ((values: object) => object),
        filter: (field: FieldInstance) => boolean = () => true
      ) {
        const values = typeof data === 'function' ? data(self.values) : data;
        self.immInitialValues = { ...values };
        self.xValues = observable({ ...values });
        transaction(() => {
          self.fields.forEach((field) => {
            if (filter(field)) {
              self.changeSiliently(field.name, field.initialValue);
              field.resetFlags();
              field.validation.resetValidationFlags();
            }
          });
        });
      },
      subscribe(setup: SubscribeSetup<SubscribeArgs>): any {
        return getSetupRunner<SubscribeArgs>({
          ...getResolvers(self as FormInstance),
          form: self as FormInstance
        })(setup);
      }
      // use(...decorators: FormFeature[]): () => void {
      //   const undecorators: ReturnType<FormFeature>[] = [];
      //   for (const decorator of decorators) {
      //     const undecorate = decorator(self as FormInstance);
      //     undecorators.push(undecorate);
      //   }
      //   return () => {
      //     for (const undecorate of undecorators) {
      //       undecorate?.();
      //     }
      //   };
      // }
    };
  })
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
    }
    // validateFields: flow(function* validate({
    //   abortEarly = false
    // }: FormValidateCallOptions = {}) {
    //   if (!self.everValitated) {
    //     self.everValitated = true;
    //   }
    //   if (self.validating) {
    //     return;
    //   }
    //   const syncErrors: Array<{ name: string; messages: string[] }> = [];
    //   for (const field of self.fields.values()) {
    //     if (field.ignored === false) {
    //       yield field.validation.validate({
    //         sync: true,
    //         async: false,
    //         noPending: true
    //       });
    //       if (field.validation.status === 'INVALID') {
    //         syncErrors.push({
    //           name: field.name,
    //           messages: [...field.validation.syncMessages]
    //         });
    //         if (abortEarly) {
    //           return syncErrors;
    //         }
    //       }
    //     }
    //   }
    //   if (syncErrors.length) {
    //     return syncErrors;
    //   }
    //   const asyncErrors: Array<{ name: string; messages: string[] }> = [];
    //   self.validating = true;
    //   const errors = yield Promise.all(
    //     [...self.fields.values()].map((field) =>
    //       field.validation
    //         .validate({ sync: false, async: true, noPending: false })
    //         .then(() => {
    //           if (field.validation.status === 'INVALID') {
    //             asyncErrors.push({
    //               name: field.name,
    //               messages: [...field.validation.asyncMessages]
    //             });
    //             if (abortEarly) {
    //               return Promise.reject(asyncErrors);
    //             }
    //           }
    //         })
    //     )
    //   ).then(
    //     () => null,
    //     (errors: Array<{ name: string; messages: string[] }>) => errors
    //   );
    //   if (Array.isArray(errors)) {
    //     self.validating = false;
    //     return errors;
    //   }
    //   self.validating = false;
    //   if (asyncErrors.length) {
    //     return asyncErrors;
    //   }
    // })
  }))
  .named('Form');

type FormDesignType = typeof Form;
export interface FormDesignInterface extends FormDesignType {}

export interface FormInstance extends Instance<FormDesignInterface> {}

export interface FormValidateCallOptions {
  abortEarly?: boolean;
}

export interface FormConfig<V> extends CreateValidationFeatureOptions {
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
}: Pick<FormConfig<V>, 'initialValues'> = {}): FormInstance {
  const ajv = createAjv();
  ajvErrors(ajv);
  const form = Form.create(
    {
      immInitialValues: initialValues ? { ...initialValues } : {},
      validating: false,
      everValitated: false,
      _plain: false,
      _messageVariables: undefined,
      _validateMessages: undefined
    },
    { ajv }
  );

  return form;
}
