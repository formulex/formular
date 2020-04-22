import { types, Instance, flow } from 'mobx-state-tree';
import { observable } from 'mobx';
import { FieldInstance } from '../../models/field';

export interface AsyncValidator {
  (value: any): Promise<any>;
}

export interface Validator {
  (value: any): any;
}

export const FieldValidation = types
  .model('FieldValidation', {
    name: types.string,
    messages: types.array(types.string),
    pending: types.boolean
  })
  .volatile((self) => ({
    validator: observable.box<undefined | Validator>(undefined, {
      deep: false,
      name: `_Validator_Of${self.name}`
    }),
    asyncValidator: observable.box<undefined | AsyncValidator>(undefined, {
      deep: false,
      name: `_AsyncValidator_Of${self.name}`
    }),
    field: observable.box<undefined | FieldInstance>(undefined, {
      deep: false,
      name: `_Field_Ref_${self.name}`
    })
  }))
  .views((self) => ({
    get status(): 'PENDING' | 'VALID' | 'INVALID' {
      if (self.pending) {
        return 'PENDING';
      }
      if (self.messages.length) {
        return 'INVALID';
      }
      return 'VALID';
    }
  }))
  .actions((self) => ({
    setValidator(validator: Validator) {
      self.validator.set(validator);
    },
    setAsyncValidator(validator: AsyncValidator) {
      self.asyncValidator.set(validator);
    },
    setFieldRef(field: FieldInstance) {
      self.field.set(field);
    },
    validate: flow(function* validate() {
      const validator = self.validator.get();
      const asyncValidator = self.asyncValidator.get();
      const field = self.field.get();

      self.messages.push('required');

      if (!field) {
        return;
      }

      // Sync
      if (typeof validator === 'function') {
        let messages: string[] = [];
        let pass = false;
        try {
          validator(field.value);
          pass = true;
        } catch (e) {
          if (Array.isArray(e?.errors)) {
            messages.push(...e.errors.map((err: any) => String(err)));
          } else if (e instanceof Error) {
            messages.push(e.message);
          } else if (typeof e === 'string') {
            messages.push(e);
          } else {
            throw e;
          }
        }
        if (!pass) {
          self.messages.replace(messages);
          return;
        }
      }

      // Async
      if (typeof asyncValidator === 'function') {
        let messages: string[] = [];
        let pass = false;
        self.pending = true;
        try {
          yield asyncValidator(field.value);
          pass = true;
        } catch (e) {
          if (Array.isArray(e?.errors)) {
            messages.push(...e.errors.map((err: any) => String(err)));
          } else if (e instanceof Error) {
            messages.push(e.message);
          } else if (typeof e === 'string') {
            messages.push(e);
          } else {
            throw e;
          }
        }
        self.pending = false;
        if (!pass) {
          self.messages.replace(messages);
        }
      }
    }),
    beforeDestroy() {
      self.validator.set(void 0);
      self.validator.set(void 0);
      self.field.set(void 0);
    }
  }));

export type FiedlValidationInstance = Instance<typeof FieldValidation>;

export interface FieldValidationConfig {
  name: string;
}

export function createFieldValidation({
  name
}: FieldValidationConfig): FiedlValidationInstance {
  return FieldValidation.create({ name, pending: false });
}
