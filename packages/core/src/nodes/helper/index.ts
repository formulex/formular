import {
  ITypeDispatcher,
  IAnyStateTreeNode
} from 'mobx-state-tree/dist/internal';
import { walk, getType, tryResolve } from 'mobx-state-tree';
import { Field, FieldInstance } from '../field';
import { FieldGroup, FieldGroupInstance } from '../group';
import { FieldArray, FieldArrayInstance } from '../array';

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

const rightSquare = /\]/g;
const leftSquare = /\[/g;
export function name2JSONPointer(name: string): string {
  const dotPath = name.replace(rightSquare, '').replace(leftSquare, '.');
  return '/children/' + dotPath.split('.').join('/children/');
}

export function name2PathArray(name: string): string[] {
  const dotPath = name.replace(rightSquare, '').replace(leftSquare, '.');
  return dotPath.split('.');
}

export function fieldResolver(
  base: FieldGroupInstance,
  name: string
): FieldInstance | FieldGroupInstance | FieldArrayInstance | null {
  let node:
    | FieldInstance
    | FieldGroupInstance
    | FieldArrayInstance
    | null = null;
  try {
    node = tryResolve(base, name2JSONPointer(name));
  } catch (error) {
    // noop
  }
  return node;
}
