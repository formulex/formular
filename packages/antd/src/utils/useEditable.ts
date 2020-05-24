import { FieldRenderableProps } from '@formular/react';
import { useObserver } from 'mobx-react';

export function useFieldEditable(
  { field }: FieldRenderableProps,
  entryElement: any,
  outputElement: any
) {
  return useObserver(() => {
    if (field.editable === false) {
      return outputElement;
    } else {
      return entryElement;
    }
  });
}
