export interface Rule {
  required?: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string | { [key: string]: string };
  warningKeys?: 'all' | string[];
  [key: string]: any;
}

export interface AsyncRule extends Omit<Rule, 'validator'> {
  asyncValidator?: (value: any) => Promise<boolean>;
}

export interface FieldValidationConfig {
  rule?: Rule;
  asyncRule?: AsyncRule;
}
