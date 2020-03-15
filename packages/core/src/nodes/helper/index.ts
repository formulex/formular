import {
  ITypeDispatcher,
  IAnyStateTreeNode
} from 'mobx-state-tree/dist/internal';
import { walk, getType, tryResolve } from 'mobx-state-tree';
import { Field, FieldInstance, createField } from '../field';
import { FieldGroup, FieldGroupInstance, createFieldGroup } from '../group';
import { FieldArray, FieldArrayInstance, createFieldArray } from '../array';

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
  name?: string
): FieldInstance | FieldGroupInstance | FieldArrayInstance | null {
  let node:
    | FieldInstance
    | FieldGroupInstance
    | FieldArrayInstance
    | null = null;
  try {
    if (typeof name !== 'string' || name === '') {
      node = base;
    } else {
      node = tryResolve(base, name2JSONPointer(name));
    }
  } catch (error) {
    // noop
  }
  return node;
}

export interface GetOrCreateNodeConfig {
  base: FieldGroupInstance;
  initialValue?: any;
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
}

export function getOrCreateNodeFromBase(
  name: string,
  { base, initialValue, type }: GetOrCreateNodeConfig
): FieldInstance | FieldGroupInstance | FieldArrayInstance {
  // 1. find the node
  let node = fieldResolver(base, name);

  // 2. create node recursively
  if (node === null) {
    let createdNode = null;
    if (
      type === 'object' ||
      (typeof initialValue === 'object' &&
        initialValue !== null &&
        !Array.isArray(initialValue))
    ) {
      createdNode = createFieldGroup(initialValue || {});
    } else if (
      type === 'array' ||
      (typeof initialValue === 'object' &&
        initialValue !== null &&
        Array.isArray(initialValue))
    ) {
      createdNode = createFieldArray(initialValue || []);
    } else {
      createdNode = createField(initialValue);
    }
    node = createdNode;
    const pathArray = name2PathArray(name);
    let parent = base;
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

  // 3. offer node
  return node;
}
