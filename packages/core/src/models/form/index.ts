import { getType, Instance, types, clone } from 'mobx-state-tree';
import { createField, FieldInstance } from '../';
import { transaction, observable, toJS } from 'mobx';
import { setIn, getIn, changeValue } from '../../utils';
import { getResolvers, SubscribeSetup, SubscribeArgs } from '../../sideEffect';
import { Field, FieldRegisterConfig, FieldDesignInterface } from '../field';
import { FeatureCollection, FeaturePerishable } from './inner-features';
import {
  ValidateOptions,
  FieldError,
  Store,
  ValidateErrorEntity,
  ValidateMessages
} from '../field/inner-features/validation/interface';
import { defaultValidateMessages } from '../field/inner-features/validation/messages';
import { allPromiseFinish } from './asyncUtil';
import { set } from 'lodash';

export const Form = types
  .compose(
    FeatureCollection,
    FeaturePerishable,
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
  .actions((self) => ({
    setMessageVariables(val: any) {
      self._messageVariables = val;
    },
    setValidateMessages(val: any) {
      self._validateMessages = val;
    }
  }))
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
    },
    get errors() {
      const result: { [key: string]: string[] } = {};
      for (const [name, field] of self.fields.entries()) {
        result[name] = field.validation.errors;
      }
      return result;
    }
  }))
  .actions((self) => ({
    change(name: string, value: any): void {
      if (getIn(self.values, name) !== value) {
        changeValue(self.xValues, name, value);
        self.resolve(name)?.markModified(true);
        self.resolve(name)?.__changeBeat();
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
          validateMessages,
          perishable,
          plain,
          show,
          disabled,
          ignored
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
            validateMessages,
            plain,
            show,
            disabled,
            ignored
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
          transaction(() => {
            self.fieldsDisposers.get(name)?.();
            self.fieldsDisposers.delete(name);
            self.fieldsEffects.delete(name);
            self.removeField(name);
            if (perishable ?? self.perishable) {
              self.change(name, undefined);
            }
          });
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
    };
  })
  .volatile((self) => ({
    getFieldsValue(path?: string[]) {
      let result = {};
      const isArray = Array.isArray(path);
      for (const [name, field] of self.fields.entries()) {
        if ((isArray && path?.includes(name)) || path === undefined) {
          set(result, name, field.value);
        }
      }
      return { ...result };
    }
  }))
  .volatile((self) => {
    let lastValidatePromise: Promise<FieldError[]> | null = null;
    return {
      validateFields(nameList?: string[], options?: ValidateOptions) {
        const provideNameList = !!nameList;
        const namePathList: string[] | undefined = provideNameList
          ? nameList
          : [];

        // Collect result in promise list
        const promiseList: Promise<{
          name: string;
          errors: string[];
        }>[] = [];

        for (const [_, field] of self.fields.entries()) {
          if (!provideNameList) {
            namePathList?.push(field.name);
          }

          // Skip if without rule
          if (!field.validation.rules || !field.validation.rules.length) {
            continue;
          }

          // Add field validate rule in to promise list
          if (!provideNameList || namePathList?.includes(field.name)) {
            const promise = field.validation.validateRules({
              validateMessages: {
                ...defaultValidateMessages,
                ...self._validateMessages
              },
              ...options
            });

            // Wrap promise with field
            promiseList.push(
              promise
                .then(() => ({ name: field.name, errors: [] }))
                .catch((errors) =>
                  Promise.reject({
                    name: field.name,
                    errors
                  })
                )
            );
          }
        }

        const summaryPromise = allPromiseFinish(promiseList);
        lastValidatePromise = summaryPromise;

        const returnPromise: Promise<
          Store | ValidateErrorEntity | string[]
        > = summaryPromise
          .then(
            (): Promise<Store | string[]> => {
              if (lastValidatePromise === summaryPromise) {
                return Promise.resolve(self.getFieldsValue(namePathList));
              }
              return Promise.reject<string[]>([]);
            }
          )
          .catch((results: { name: string; errors: string[] }[]) => {
            const errorList = results.filter(
              (result) => result && result.errors.length
            );
            return Promise.reject({
              values: self.getFieldsValue(namePathList),
              errorFields: errorList,
              outOfDate: lastValidatePromise !== summaryPromise
            });
          });

        // Do not throw in console
        returnPromise.catch<ValidateErrorEntity>((e) => e);

        return returnPromise as Promise<Store>;
      }
    };
  })
  .volatile((self) => ({
    submit(onFinish?: OnFinish, onFinishFailed?: OnFinishFailed) {
      return self
        .validateFields()
        .then((values) => {
          try {
            onFinish?.(values);
          } catch (err) {
            // Should print error if user `onFinish` callback failed
            console.error(err);
          }
        })
        .catch((e) => {
          onFinishFailed?.(e);
        });
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
    }
  }))
  .named('Form');

type FormDesignType = typeof Form;
export interface FormDesignInterface extends FormDesignType {}

export interface FormInstance extends Instance<FormDesignInterface> {}

export interface FormValidateCallOptions {
  abortEarly?: boolean;
}

export interface FormConfig<V> {
  initialValues?: V;
  perishable?: boolean;
  plain?: boolean;
  messageVariables?: Record<string, any>;
  validateMessages?: ValidateMessages;
}

export function isFormInstance(o: any): o is FormInstance {
  return getType(o) === Form;
}

export interface OnFinish {
  (values: any): void;
}

export interface OnFinishFailed {
  (errorInfo: ValidateErrorEntity): void;
}

export function createForm<V = any>({
  initialValues,
  perishable,
  plain,
  messageVariables,
  validateMessages
}: FormConfig<V> = {}): FormInstance {
  const form = Form.create({
    immInitialValues: initialValues ? { ...initialValues } : {},
    validating: false,
    everValitated: false,
    _plain: plain ?? false,
    _messageVariables: messageVariables ?? undefined,
    _validateMessages: validateMessages ?? undefined,
    _perishable: perishable ?? false
  });

  return form;
}