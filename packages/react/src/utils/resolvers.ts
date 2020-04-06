import {
  FieldInstance,
  FieldGroupInstance,
  FieldArrayInstance,
  fieldResolver
} from '@formular/core';

export class ResolverContext {
  scopeNode: FieldGroupInstance;

  constructor(scopeNode: FieldGroupInstance) {
    this.scopeNode = scopeNode;
  }
}

export class ResolverContextManager {
  static stack: ResolverContext[] = [];

  static get top(): ResolverContext | undefined {
    const last = this.stack[this.stack.length - 1];
    return last;
  }

  static push(...args: ResolverContext[]) {
    return this.stack.push(...args);
  }

  static pop() {
    return this.stack.pop();
  }
}

export function resolver(
  name?: string
): FieldInstance | FieldGroupInstance | FieldArrayInstance | null {
  if (ResolverContextManager.top?.scopeNode) {
    return fieldResolver(ResolverContextManager.top?.scopeNode, name);
  } else {
    throw new Error(
      'resolver (e.g. feild(\'...\'), value(\'...\')) should run with scope context. Check that call in <Scope /> or <Container />, or scopeFlow(<generator>) or oflow(<generator>), or withContext(() => any).'
    );
  }
}

export function field(name: string): FieldInstance {
  return resolver(name) as FieldInstance;
}

export function value<V = any>(name: string) {
  return resolver(name)?.value as V;
}

export function withContext(f: () => any) {
  const temp = ResolverContextManager.top?.scopeNode;
  if (!temp) {
    throw new Error(
      'withContent(() => any) should run in <Scope /> or <Container /> or withContext(() => any).'
    );
  }

  return () => {
    ResolverContextManager.push(new ResolverContext(temp));
    const result = f();
    ResolverContextManager.pop();
    return result;
  };
}
