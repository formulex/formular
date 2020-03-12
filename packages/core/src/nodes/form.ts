import { types, Instance, flow } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup, FieldGroupInstance } from './group';
import { FieldInstance, createField } from './field';
import { FieldArrayInstance, createFieldArray } from './array';
import { fieldResolver, name2PathArray } from './helper';

export const Form = types
  .model('Form', {
    root: FieldGroup,
    isSubmitting: types.boolean
  })
  .views(self => ({
    get value() {
      return self.root.value;
    },
    get initialValue() {
      return self.root.initialValue;
    },
    get clear() {
      return self.root.clear;
    },
    get reset() {
      return self.root.reset;
    }
  }))
  .actions(self => {
    return {
      submit: flow<{ [key: string]: any }, []>(function* submit() {
        self.isSubmitting = true;
        yield new Promise(r => setTimeout(r, 500));
        self.isSubmitting = false;
        return self.root.value;
      }),
      registerField(
        name: string,
        applyEffectFn: (
          node: FieldInstance | FieldGroupInstance | FieldArrayInstance
        ) => () => void,
        config: {
          initialValue: any;
          type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
        } = {
          type: undefined,
          initialValue: undefined
        }
      ): () => void {
        let node = fieldResolver(self.root, name);

        if (node === null) {
          let createdNode = null;
          if (
            config.type === 'object' ||
            (typeof config.initialValue === 'object' &&
              config.initialValue !== null &&
              !Array.isArray(config.initialValue))
          ) {
            createdNode = createFieldGroup(config.initialValue || {});
          } else if (
            config.type === 'array' ||
            (typeof config.initialValue === 'object' &&
              Array.isArray(config.initialValue))
          ) {
            createdNode = createFieldArray(config.initialValue || []);
          } else {
            createdNode = createField(config.initialValue);
          }
          node = createdNode;
          const pathArray = name2PathArray(name);
          let parent = self.root;
          pathArray.forEach((pathToken, index, array) => {
            const hasNode =
              typeof parent.children.has === 'function' &&
              parent.children.has(pathToken);
            if (index !== array.length - 1) {
              if (!hasNode) {
                parent.addChild(pathToken, createFieldGroup({}));
              }
              parent = parent.children.get(pathToken);
            } else {
              parent.addChild(pathToken, node);
            }
          });
        }

        const disposer = applyEffectFn(node);
        if (typeof disposer !== 'function') {
          throw new Error(
            `Apply Effect Function should return a unsubscription function, but got ${disposer} with type ${typeof disposer}.`
          );
        }
        return disposer;
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
  !root.initialValue;
  root.patchValue(values);
  return Form.create({
    root,
    isSubmitting: false
  });
}
