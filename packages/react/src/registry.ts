import React from 'react';

export interface RegistryEntry<XFormProps = any> {
  formItemComponent?: React.JSXElementConstructor<any>;
  formComponent?: string | React.JSXElementConstructor<XFormProps>;
  fields?: {
    [key: string]: React.ComponentType<any>;
  };
}

export class Registry implements RegistryEntry {
  formItemComponent: React.JSXElementConstructor<any>;
  registerLocalItemComponent(component: React.ComponentType<any>) {
    if (component) {
      this.formItemComponent = component;
    }
  }
  unregisterLocalItemComponent() {
    this.formItemComponent = Registry.global_formItemComponent;
  }

  formComponent: string | React.JSXElementConstructor<any>;
  registerLocalFormComponent(component: React.ComponentType<any>) {
    if (component) {
      this.formComponent = component;
    }
  }
  unregisterLocalFormComponent() {
    this.formComponent = Registry.global_formComponent;
  }

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

  private static global_formComponent:
    | string
    | React.JSXElementConstructor<any> = 'form';
  public static registerGlobalFormComponent<P>(
    component: React.ComponentType<P>
  ) {
    if (component) {
      this.global_formComponent = component;
    }
  }

  private static global_formItemComponent: React.JSXElementConstructor<
    any
  > = (({ children }) => children) as React.FC<any>;
  public static registerGlobalFormItemComponent<P>(
    component: React.ComponentType<P>
  ) {
    if (component) {
      this.global_formItemComponent = component;
    }
  }

  private static global_fields: {
    [key: string]: React.ComponentType<any>;
  };
  public static registerGlobalField(
    name: string,
    component: React.ComponentType<any>
  ) {
    if (typeof name === 'string' && component) {
      if (this.global_fields[name]) {
        console.warn(`Component "${name}" exists. It will override.`);
      }

      this.global_fields[name] = component;
      if (typeof this.global_fields[name].displayName !== 'string') {
        this.global_fields[name].displayName = name;
      }
    }
  }
  public static registerGlobalFields(obj: Registry['fields']) {
    Object.keys(obj).forEach((name) => {
      const component = obj[name];
      this.registerGlobalField(name, component);
    });
  }
  public static clear() {
    this.global_fields = {};
  }

  constructor() {
    this.formComponent = Registry.global_formComponent;
    this.formItemComponent = Registry.global_formItemComponent;
    this.fields = Registry.global_fields;
  }
}
