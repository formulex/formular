import {
  types,
  getParentOfType,
  cast,
  addMiddleware,
  Instance,
  isAlive
} from 'mobx-state-tree';
import type {
  ValidateOptions,
  RuleObject,
  ValidateMessages
} from './interface';
import { toArray } from './utils';
import { validateRules } from './validating';
import { Field } from '../..';
import { Form } from '../../../form';
import { merge, cloneDeep, isPlainObject } from 'lodash';
import { defaultValidateMessages } from './messages';

const Validation = types
  .model('Validation', {
    // all validation errors
    errors: types.array(types.string),

    // extra vars when generate error string
    _messageVariables: types.maybe(types.frozen()),
    _validateMessages: types.maybe(types.frozen()),

    // rule level
    validateFirst: types.boolean,

    // flag
    validating: types.boolean,

    // timing
    validateTrigger: types.union(types.string, types.array(types.string))
  })
  .volatile(() => ({
    rules: [] as RuleObject[]
  }))
  .views((self) => ({
    get messageVariables(): any {
      return (
        self._messageVariables ??
        getParentOfType(self, Form)._messageVariables ??
        {}
      );
    },
    get validateMessages(): ValidateMessages {
      return (
        (self._validateMessages &&
          merge({}, defaultValidateMessages, self._validateMessages)) ??
        (getParentOfType(self, Form)._validateMessages &&
          merge(
            {},
            defaultValidateMessages,
            getParentOfType(self, Form)._validateMessages
          )) ??
        cloneDeep(defaultValidateMessages)
      );
    }
  }))
  .actions((self) => ({
    setErrors(errors: string[]) {
      self.errors = cast(errors);
    },
    setValidating(val: boolean) {
      self.validating = val;
    },
    setValidateFirst(val: boolean) {
      self.validateFirst = val;
    },
    setMessageVariables(val: any) {
      self._messageVariables = val;
    },
    setValidationMessages(val: any) {
      self._validateMessages = val;
    },
    setRules(rule: RuleObject | RuleObject[]) {
      if (isPlainObject(rule)) {
        self.rules = [rule as RuleObject];
      } else if (Array.isArray(rule)) {
        self.rules = [...rule];
      }
    },
    setValidateTrigger(triggers: string[]) {
      self.validateTrigger = cast(triggers);
    },
    resetValidationFlags() {
      self.errors.clear();
    }
  }))
  .actions((self) => ({
    validateRules(options: ValidateOptions = {}) {
      const { triggerName, validateMessages = self.validateMessages } = options;
      let filteredRules = [...self.rules];

      // current trigger
      if (triggerName) {
        filteredRules = filteredRules.filter((rule: RuleObject) => {
          const { validateTrigger } = rule;
          if (!validateTrigger) {
            return true;
          }
          const triggerList = toArray(validateTrigger);
          return triggerList.includes(triggerName);
        });
      }

      const field = getParentOfType<any>(self, Field);

      const promise = validateRules(
        field.name,
        field.value,
        filteredRules,
        { ...options, validateMessages },
        self.validateFirst,
        self.messageVariables
      );
      self.setValidating(true);
      self.setErrors([]);

      promise
        .catch((e) => e)
        .then((errors: string[] = []) => {
          if (isAlive(self) && self.validating) {
            self.setValidating(false);
            self.setErrors(errors);
          }
        });

      return promise;
    }
  }));

export interface ValidationInstance extends Instance<typeof Validation> {}

export interface CreateValidationOptions {
  validateFirst?: boolean;
  validateTrigger?: string | string[];
  rule?: RuleObject | RuleObject[];
}

export function createValidation({
  validateFirst,
  validateTrigger,
  rule
}: CreateValidationOptions = {}): ValidationInstance {
  const instance = Validation.create({
    errors: [],
    _messageVariables: undefined,
    _validateMessages: undefined,
    validateFirst: validateFirst ?? false,
    validating: false,
    validateTrigger: validateTrigger ?? ['change']
  });

  if (rule) {
    instance.setRules(rule);
  }

  return instance;
}

// ✨Feature - ✨Validation
export const FeatureValidation = types
  .model('✨Validation', {
    validation: Validation
  })
  .actions((self) => {
    let disposer: null | (() => void) = null;
    function isOrHas(
      triggers: string | string[] | undefined,
      triggerName: string
    ): boolean {
      if (typeof triggers === 'string') {
        return triggerName === triggers;
      } else if (Array.isArray(triggers)) {
        return triggers.includes(triggerName);
      }
      return false;
    }
    return {
      afterCreate() {
        disposer = addMiddleware(self, (call, next, abort) => {
          const validateOnChange = isOrHas(
            self.validation.validateTrigger,
            'change'
          );
          const validateOnBlur = isOrHas(
            self.validation.validateTrigger,
            'blur'
          );
          if (
            validateOnChange &&
            call.type === 'action' &&
            call.name === 'change' &&
            call.context === self
          ) {
            self.validation.validateRules({
              triggerName: 'change'
            });
          }

          if (
            validateOnBlur &&
            call.type === 'action' &&
            call.name === 'blur' &&
            call.context === self
          ) {
            self.validation.validateRules({
              triggerName: 'blur'
            });
          }

          return next(call);
        });
      },
      beforeDestroy() {
        disposer?.();
      }
    };
  });
