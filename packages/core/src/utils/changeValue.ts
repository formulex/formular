import set from 'lodash.set';
import unset from 'lodash.unset';

export function changeValue(target: any, name: string, value: any): void {
  if (value === undefined) {
    unset(target, name);
  } else {
    set(target, name, value);
  }
}
