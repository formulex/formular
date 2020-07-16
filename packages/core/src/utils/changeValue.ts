import { set, unset } from 'lodash';

export function changeValue(target: any, name: string, value: any): void {
  if (value === undefined) {
    unset(target, name);
  } else {
    set(target, name, value);
  }
}
