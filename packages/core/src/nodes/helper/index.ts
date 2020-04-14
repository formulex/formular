import type {
  ITypeDispatcher,
  IAnyStateTreeNode
} from 'mobx-state-tree/dist/internal';
import { walk, getType, tryResolve, getEnv } from 'mobx-state-tree';
import { Field, FieldInstance, createField, isFieldInstance } from '../field';
import { FieldGroup, FieldGroupInstance, createFieldGroup } from '../group';
import { FieldArray, FieldArrayInstance, createFieldArray } from '../array';
import { Rule, AsyncRule } from '../../validation/types';
import { transaction } from 'mobx';
import { Validators } from '../..';
import { FormEnvironment } from '../form';
import { uid } from '../../utils/uid';

export const dispatcher: ITypeDispatcher = (snapshot) => {
  if (
    typeof snapshot.children === 'object' &&
    snapshot.children !== null &&
    !Array.isArray(snapshot.children)
  ) {
    return FieldGroup;
  } else if (
    typeof snapshot.children === 'object' &&
    Array.isArray(snapshot.children)
  ) {
    return FieldArray;
  } else if (typeof snapshot.children === 'undefined') {
    return Field;
  }
  return Field;
  // throw new Error(`Cannot find type for ${snapshot}`);
};

export function walkFieldNode(
  root: IAnyStateTreeNode,
  fn: (node: IAnyStateTreeNode) => void
) {
  walk(root, (node) => {
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
  rules?: Rule[];
  asyncRules?: AsyncRule[];
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
}

export function getOrCreateNodeFromBase(
  name: string,
  {
    base,
    initialValue,
    type,
    rules = [],
    asyncRules = []
  }: GetOrCreateNodeConfig
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

  // 3. add rules
  transaction(() => {
    if (isFieldInstance(node)) {
      const { validators } = getEnv<FormEnvironment>(base);
      const { keys: ruleKeys, messages: ruleMessages } = applyRules(
        rules,
        validators
      );
      const {
        keys: asyncruleKeys,
        messages: asyncruleMessages
      } = applyAsyncRules(asyncRules, validators);
      node.setValidatorKeys(ruleKeys);
      node.setAsyncValidatorKeys(asyncruleKeys);
      node.setValidateMessages({
        ...ruleMessages,
        ...asyncruleMessages
      });
    }
  });

  // 4. offer node
  return node;
}

export function applyRules(rules: Rule[], validators: Validators) {
  const keys: (string | any[])[] = [];
  const messages: { [key: string]: string } = {};
  for (const rule of rules) {
    if (rule.required) {
      keys.push('required');
      Object.assign(messages, { required: rule.message });
    }
    if (typeof rule.max === 'number') {
      keys.push(['max', rule.max]);
      Object.assign(messages, { max: rule.message });
    }
    if (typeof rule.min === 'number') {
      keys.push(['min', rule.min]);
      Object.assign(messages, { min: rule.message });
    }
    if (typeof rule.format === 'string') {
      keys.push(rule.format);
      Object.assign(messages, { [rule.format]: rule.message });
    }
    if (typeof rule.validator === 'function') {
      const name = `CustomValidator:${uid()}`;
      validators.registerValidator(name, rule.validator);
      keys.push(name);
      Object.assign(messages, { [name]: rule.message });
    }
  }
  return { keys, messages };
}

export function applyAsyncRules(rules: AsyncRule[], validators: Validators) {
  const keys: (string | any[])[] = [];
  const messages: { [key: string]: string } = {};
  for (const rule of rules) {
    if (typeof rule.validator === 'function') {
      const name = `CustomAsyncValidator:${uid()}`;
      validators.registerValidator(name, rule.validator);
      keys.push(name);
      Object.assign(messages, { [name]: rule.message });
    }
  }
  return { keys, messages };
}
