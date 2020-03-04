import { ITypeDispatcher } from 'mobx-state-tree/dist/internal';
import { Field } from '../field';
import { FieldGroup } from '../group';
import { FieldArray } from '../array';

export const dispatcher: ITypeDispatcher = snapshot => {
  if (typeof snapshot.children === 'object' && !Array.isArray(snapshot.children)) {
    return FieldGroup;
  }
  if (typeof snapshot.children === 'object' && Array.isArray(snapshot.children)) {
    return FieldArray;
  }
  return Field;
};
