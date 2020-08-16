import { shallowEqual } from '@formular/core';

export function shallowEqualComponentValue<
  V extends { value?: any; [key: string]: any }
>({ value: aValue, ...aRest }: V, { value: bValue, ...bRest }: V) {
  return shallowEqual(aValue, bValue) && shallowEqual(aRest, bRest);
}
