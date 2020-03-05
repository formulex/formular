import { types, Instance, flow, walk, getType } from 'mobx-state-tree';
import { FieldGroup, createFieldGroup } from './group';
import { FieldArray } from './array';
import { Field } from './field';

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
        walk(self.root, node => {
          const type = getType(node);
          if (
            [Field, FieldGroup, FieldArray].some(
              fieldType => fieldType === type
            )
          ) {
            console.log('node with type', type);
            console.log('node =', node);
          }
        });
      }
    };
  });

export type FormInstance = Instance<typeof Form>;

export interface CreateFormOptions<Values> {
  initialValues?: Partial<Values>;
  values?: Partial<Values>;
  // //生命周期监听器，在这里主要传入FormLifeCycle的实例化对象
  // lifecycles?: FormLifeCycle[];
  // //是否可编辑，在Form维度整体控制
  // editable?: boolean | ((name: string) => boolean);
  // //是否使用脏检查，默认会走immer精确更新
  // useDirty?: boolean;
  // //是否走悲观校验，遇到第一个校验失败就停止后续校验
  // validateFirst?: boolean;
  // //表单变化事件回调
  // onChange?: (values: any) => void;
  // //表单提交事件回调
  // onSubmit?: (values: IFormState['values']) => any | Promise<any>;
  // //表单重置事件回调
  // onReset?: () => void;
  // //表单校验失败事件回调
  // onValidateFailed?: (validated: IFormValidateResult) => void;
}

export function createForm<Values = any>({
  initialValues = {},
  values = {}
}: CreateFormOptions<Values>) {
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
