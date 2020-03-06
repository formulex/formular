import { types, Instance, flow } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup } from './group';
import { walkFieldNode } from './helper';

export const Form = types
  .model('Form', {
    root: FieldGroup,
    isSubmitting: types.boolean
  })
  .actions(self => {
    return {
      submit: flow<{ [key: string]: any }, []>(function* submit() {
        self.isSubmitting = true;
        yield new Promise(r => setTimeout(r, 500));
        self.isSubmitting = false;
        return self.root.value;
      }),
      reset() {
        walkFieldNode(self.root, node => {
          console.log('node =', node);
        });
      }
    };
  });

export type FormInstance = Instance<typeof Form>;

export interface CreateFormOptions<Values> {
  initialValues?: Partial<Values>;
  values?: Partial<Values>;
}

export function createForm<Values = any>({
  initialValues = {},
  values = {}
}: CreateFormOptions<Values>): FormInstance {
  const root = createFieldGroup(initialValues);
  // fixme: debug for "walk" method in "mobx-state-tree"
  // see https://github.com/mobxjs/mobx-state-tree/issues/1433
  !root.value;
  root.patchValue(values);
  return Form.create({
    root,
    isSubmitting: false
  });
}
