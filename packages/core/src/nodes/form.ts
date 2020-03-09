import { types, Instance, flow, tryResolve } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup, FieldGroupInstance } from './group';
import { FieldInstance, createField } from './field';
import { FieldArrayInstance, createFieldArray } from './array';

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
    const rightSquare = /\]/g;
    const leftSquare = /\[/g;
    function name2JSONPointer(name: string): string {
      const dotPath = name.replace(rightSquare, '').replace(leftSquare, '.');
      return '/children/' + dotPath.split('.').join('/children/');
    }

    function name2PathArray(name: string): string[] {
      const dotPath = name.replace(rightSquare, '').replace(leftSquare, '.');
      return dotPath.split('.');
    }

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
        let node:
          | FieldInstance
          | FieldGroupInstance
          | FieldArrayInstance
          | null = null;
        try {
          node = tryResolve(self.root, name2JSONPointer(name));
        } catch (error) {
          // noop
        }

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
            console.log('outter', pathToken, parent.value);
            const hasNode =
              (typeof parent.children.has === 'function' &&
                parent.children.has(pathToken)) ||
              parent.children.get(pathToken) === null;
            console.log(
              'hasNode =',
              typeof parent.children.has === 'function' &&
                parent.children.has(pathToken),
              parent.children.get(pathToken)
            );
            if (index !== array.length - 1) {
              if (!hasNode) {
                console.log('pathToken', pathToken);
                console.log('parent', parent);
                parent.addChild(pathToken, createFieldGroup({}));
                console.log('after parent', parent);
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
