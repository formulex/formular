import React from 'react';

export interface RegistryEntry {
  fields?: {
    [key: string]: React.ComponentType<any>;
  };
}

export class Registry implements RegistryEntry {
  fields: {
    [key: string]: React.ComponentType<any>;
  };
  registerLocalField(name: string, component: React.ComponentType<any>) {
    if (typeof name === 'string' && component) {
      if (this.fields[name]) {
        console.warn(`Component "${name}" exists. It will override.`);
      }

      this.fields[name] = component;
      if (typeof this.fields[name].displayName !== 'string') {
        this.fields[name].displayName = name;
      }
    }
  }
  registerLocalFields(obj: Registry['fields']) {
    Object.keys(obj).forEach((name) => {
      const component = obj[name];
      this.registerLocalField(name, component);
    });
  }
  unregisterLocalField(name: string) {
    if (typeof name === 'string') {
      if (!this.fields[name]) {
        console.warn(`Component "${name}" doesn't exist.`);
      }

      delete this.fields[name];
    }
  }
  unregisterLocalFields(...names: string[]) {
    for (const name of names) {
      this.unregisterLocalField(name);
    }
  }

  private static global_fields: {
    [key: string]: React.ComponentType<any>;
  } = {};
  public static registerGlobalField(
    name: string,
    component: React.ComponentType<any>
  ) {
    if (typeof name === 'string' && component) {
      if (Registry.global_fields[name]) {
        console.warn(`Component "${name}" exists. It will override.`);
      }

      Registry.global_fields[name] = component;
      if (typeof Registry.global_fields[name].displayName !== 'string') {
        Registry.global_fields[name].displayName = name;
      }
    }
  }
  public static registerGlobalFields(obj: Registry['fields']) {
    Object.keys(obj).forEach((name) => {
      const component = obj[name];
      Registry.registerGlobalField(name, component);
    });
  }
  public static clear() {
    Registry.global_fields = {};
  }

  constructor() {
    this.fields = Registry.global_fields;
  }
}
