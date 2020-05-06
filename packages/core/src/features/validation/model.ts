import {
  flow,
  getEnv,
  getParentOfType,
  Instance,
  types
} from 'mobx-state-tree';
import type { AsyncRule, Rule } from './types';
import { FormEnvironment } from '../../models/form';
import { Field } from '../../models/field';
import { ErrorObject } from 'ajv';

export const Validation = types
  .model('Validation', {
    messages: types.array(types.string),
    pending: types.boolean,
    valid: types.maybe(types.boolean),
    schemaKey: types.maybe(types.string),
    warningKeys: types.maybe(
      types.union(types.literal('all'), types.array(types.string))
    ),
    asyncSchemaKey: types.maybe(types.string),
    asyncWarningKeys: types.maybe(
      types.union(types.literal('all'), types.array(types.string))
    )
  })
  .views((self) => {
    function getWarningKeysPasser(warningKeys: 'all' | string[]) {
      return (errors: ErrorObject[] | null | undefined) => {
        if (warningKeys === 'all' || !Array.isArray(errors)) {
          return true;
        } else if (
          Array.isArray(warningKeys) &&
          warningKeys.length === 0 &&
          errors.length
        ) {
          return false;
        } else {
          const flattenErrors: ErrorObject[] = [];
          for (const error of errors) {
            if (
              error.keyword === 'errorMessage' &&
              Array.isArray((error.params as any)?.errors)
            ) {
              flattenErrors.push(...(error.params as any).errors);
            } else {
              flattenErrors.push(error);
            }
          }
          return (
            flattenErrors.filter(
              ({ schemaPath }) =>
                !warningKeys.some((key) => schemaPath.startsWith(`#/${key}`))
            ).length === 0
          );
        }
      };
    }
    return {
      get warningsPasser() {
        if (self.warningKeys === 'all' || Array.isArray(self.warningKeys)) {
          return getWarningKeysPasser(self.warningKeys);
        }
        return undefined;
      },
      get asyncWarningsPasser() {
        if (
          self.asyncWarningKeys === 'all' ||
          Array.isArray(self.asyncWarningKeys)
        ) {
          return getWarningKeysPasser(self.asyncWarningKeys);
        }
        return undefined;
      }
    };
  })
  .views((self) => ({
    get status(): 'IGNORED' | 'PENDING' | 'VALID' | 'INVALID' | 'WARNING' {
      if (self.pending || self.valid === undefined) {
        return 'PENDING';
      }
      if (self.valid === false) {
        return 'INVALID';
      } else {
        if (self.messages.length) {
          return 'WARNING';
        }
        return 'VALID';
      }
    },
    get field(): any {
      return getParentOfType(self, Field);
    },
    get validator() {
      if (typeof self.schemaKey === 'string') {
        const { ajv } = getEnv<FormEnvironment>(self);
        const raw = ajv.getSchema(self.schemaKey);
        if (raw) {
          return (data: any) => {
            const isValid = raw(data) as boolean;
            return {
              isValid:
                typeof self.warningsPasser === 'function'
                  ? self.warningsPasser(raw.errors)
                  : isValid,
              errors: raw.errors
            };
          };
        }
      }
      return undefined;
    },
    get asyncValidator() {
      if (typeof self.asyncSchemaKey === 'string') {
        const { ajv } = getEnv<FormEnvironment>(self);
        const raw = ajv.getSchema(self.asyncSchemaKey);
        if (raw) {
          return async (data: any) => {
            const isValid = await (raw(data) as Promise<boolean>);
            return {
              isValid:
                typeof self.asyncWarningsPasser === 'function'
                  ? self.asyncWarningsPasser(raw.errors)
                  : isValid,
              errors: raw.errors
            };
          };
        }
      }
      return undefined;
    }
  }))
  .actions((self) => ({
    clearSchema() {
      self.schemaKey = undefined;
      self.warningKeys = undefined;
    },
    clearAsyncSchema() {
      self.asyncSchemaKey = undefined;
      self.asyncWarningKeys = undefined;
    }
  }))
  .actions((self) => ({
    applyRule(rule: Rule): () => void {
      const { validator, warningKeys, ...schema } = rule;
      const { ajv } = getEnv<FormEnvironment>(self);
      let customKeyword = '';
      let customSchemaKey = '';
      if (typeof validator === 'function') {
        customKeyword = `${self.field.name}_validator`;
        ajv.addKeyword(customKeyword, {
          validate: (_: any, data: any) => validator(data),
          errors: false
        });
      }
      customSchemaKey = `${self.field.name}_schema`;
      ajv.addSchema(schema, customSchemaKey);
      self.schemaKey = customSchemaKey;
      self.warningKeys = warningKeys;
      return () => {
        ajv.removeSchema(customSchemaKey);
        self.clearSchema();
        if (customKeyword) {
          ajv.removeKeyword(customKeyword);
        }
      };
    },
    applyAsyncRule(asyncRule: AsyncRule): () => void {
      const { asyncValidator, warningKeys, ...schema } = asyncRule;
      const { ajv } = getEnv<FormEnvironment>(self);
      let customKeyword = '';
      let customSchemaKey = '';
      if (typeof asyncValidator === 'function') {
        customKeyword = `${self.field.name}_async_validator`;
        ajv.addKeyword(customKeyword, {
          async: true,
          validate: (_: any, data: any) => asyncValidator(data),
          errors: false
        });
      }
      customSchemaKey = `${self.field.name}_async_schema`;
      ajv.addSchema(schema, customSchemaKey);
      self.asyncSchemaKey = customSchemaKey;
      self.asyncWarningKeys = warningKeys;
      return () => {
        ajv.removeSchema(customSchemaKey);
        self.clearAsyncSchema();
        if (customKeyword) {
          ajv.removeKeyword(customKeyword);
        }
      };
    },
    validate: flow(function* validate() {
      const validator = self.validator;
      const asyncValidator = self.asyncValidator;
      const field = self.field;

      if (!field) {
        return;
      }

      // Sync
      if (typeof validator === 'function') {
        const messages: string[] = [];
        const { isValid, errors } = validator(field.value);
        if (Array.isArray(errors)) {
          for (const { message } of errors) {
            if (typeof message === 'string') {
              messages.push(message);
            }
          }
        }
        self.valid = isValid;
        if (!isValid) {
          self.messages.replace(messages);
          return;
        }
      }

      // Async
      if (typeof asyncValidator === 'function') {
        const messages: string[] = [];
        self.pending = true;
        const { isValid, errors } = yield asyncValidator(field.value);
        if (Array.isArray(errors)) {
          for (const { message } of errors) {
            if (typeof message === 'string') {
              messages.push(message);
            }
          }
        }
        self.pending = false;
        self.valid = isValid;
        if (!isValid) {
          self.messages.replace(messages);
        }
      }
    })
  }));

export type FiedlValidationInstance = Instance<typeof Validation>;

export function createFieldValidation(): FiedlValidationInstance {
  return Validation.create({
    messages: [],
    pending: false,
    valid: undefined
  });
}
