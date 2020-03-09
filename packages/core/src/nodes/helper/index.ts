import {
  ITypeDispatcher,
  IAnyStateTreeNode
} from 'mobx-state-tree/dist/internal';
import { walk, getType } from 'mobx-state-tree';
import { Field } from '../field';
import { FieldGroup } from '../group';
import { FieldArray } from '../array';

export const dispatcher: ITypeDispatcher = snapshot => {
  if (
    typeof snapshot.children === 'object' &&
    snapshot.children !== null &&
    !Array.isArray(snapshot.children)
  ) {
    return FieldGroup;
  }
  if (
    typeof snapshot.children === 'object' &&
    Array.isArray(snapshot.children)
  ) {
    return FieldArray;
  }
  return Field;
};

export function walkFieldNode(
  root: IAnyStateTreeNode,
  fn: (node: IAnyStateTreeNode) => void
) {
  walk(root, node => {
    const type = getType(node);
    if (type === Field || type === FieldGroup || type === FieldArray) {
      fn(node);
    }
  });
}
