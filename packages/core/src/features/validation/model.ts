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
import { ValidationError, ErrorObject } from 'ajv';
import { globalConfig } from '../../globalConfigure';
import ajvErrors from 'ajv-errors';

export const Validation = types
  .model('Validation', {
    asyncMessages: types.array(types.string),
    syncMessages: types.array(types.string),
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
      get messages() {
        return [...self.syncMessages, ...self.asyncMessages];
      },
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
            const isValid = raw.call(ajv, data) as boolean;
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
            let pass = false;
            let errors: any = [];
            try {
              await (raw(data) as Promise<boolean>);
              pass = true;
            } catch (err) {
              if (!(err instanceof ValidationError)) throw err;
              errors = err.errors;
            }

            return {
              isValid:
                typeof self.asyncWarningsPasser === 'function'
                  ? self.asyncWarningsPasser(errors)
                  : pass,
              errors
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
          validate: (_: any, data: any) => {
            return validator(data);
          },
          errors: false
        });
        ajv.removeKeyword('errorMessage');
        ajvErrors(ajv);
        Object.assign(schema, { [customKeyword]: true });
        if (
          typeof schema.errorMessage === 'object' &&
          schema.errorMessage !== null &&
          typeof schema.errorMessage.validator === 'string'
        ) {
          const tmp = schema.errorMessage.validator;
          delete schema.errorMessage.validator;
          schema.errorMessage[customKeyword] = tmp;
        }
      }
      customSchemaKey = `${self.field.name}_schema`;
      ajv.addSchema(schema, customSchemaKey);
      self.schemaKey = customSchemaKey;
      self.warningKeys = Array.isArray(warningKeys)
        ? warningKeys.map((key) => (key === 'validator' ? customKeyword : key))
        : warningKeys;
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
        ajv.removeKeyword('errorMessage');
        ajvErrors(ajv);
        Object.assign(schema, { [customKeyword]: true });
        if (
          typeof schema.errorMessage === 'object' &&
          schema.errorMessage !== null &&
          typeof schema.errorMessage.asyncValidator === 'string'
        ) {
          const tmp = schema.errorMessage.asyncValidator;
          delete schema.errorMessage.asyncValidator;
          schema.errorMessage[customKeyword] = tmp;
        }
      }
      customSchemaKey = `${self.field.name}_async_schema`;
      Object.assign(schema, { $async: true });
      ajv.addSchema(schema, customSchemaKey);
      self.asyncSchemaKey = customSchemaKey;
      self.asyncWarningKeys = Array.isArray(warningKeys)
        ? warningKeys.map((key) =>
            key === 'asyncValidator' ? customKeyword : key
          )
        : warningKeys;
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
        globalConfig.ajvLocalize(errors);
        if (Array.isArray(errors)) {
          for (const { message } of errors) {
            if (typeof message === 'string') {
              messages.push(message);
            }
          }
        }
        self.valid = isValid;
        self.syncMessages.replace(messages);
        if (!isValid) {
          return;
        }
      }

      // Async
      if (typeof asyncValidator === 'function') {
        const messages: string[] = [];
        self.pending = true;
        const { isValid, errors } = yield asyncValidator(field.value);
        globalConfig.ajvLocalize(errors);
        if (Array.isArray(errors)) {
          for (const { message } of errors) {
            if (typeof message === 'string') {
              messages.push(message);
            }
          }
        }

        self.pending = false;
        self.valid = isValid;
        self.asyncMessages.replace(messages);
      }
    })
  }));

export type FiedlValidationInstance = Instance<typeof Validation>;

export function createFieldValidation(): FiedlValidationInstance {
  return Validation.create({
    pending: false,
    valid: undefined
  });
}
