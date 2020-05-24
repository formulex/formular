import { FieldRenderableProps } from '@formular/react';

export function mapFieldMetaToProps(
  transformOptions: Partial<TransformOptions>
) {
  const {
    trigger,
    getValueFromEvent,
    getValueProps,
    valuePropName
  } = useTransformOptions(transformOptions);
  return function <P extends { [key: string]: any }>(
    { field }: FieldRenderableProps,
    originalProps: P
  ) {
    return {
      // onChange
      [trigger]: (...args: any[]) => {
        const val = getValueFromEvent(...args);
        field.setValue(val);
        if (typeof originalProps[trigger] === 'function') {
          originalProps[trigger].apply(null, args);
        }
      },

      // value
      [valuePropName]: getValueProps(field.value),

      // focus
      onFocus: (...args: any[]) => {
        field.focus();
        if (typeof originalProps.onFocus === 'function') {
          originalProps.onFocus.apply(null, args);
        }
      },

      // blur
      onBlur: (...args: any[]) => {
        field.blur();
        if (typeof originalProps.onBlur === 'function') {
          originalProps.onBlur.apply(null, args);
        }
      },

      // diabled
      disabled: field.disabled
    };
  };
}

export interface TransformOptions {
  trigger: string;
  valuePropName: string;
  getValueFromEvent: (...args: any[]) => any;
  getValueProps: (value: any) => any;
}

export function useTransformOptions({
  trigger = 'onChange',
  valuePropName = 'value',
  getValueFromEvent = (e) => e.target.value,
  getValueProps = (value) => value
}: Partial<TransformOptions>): TransformOptions {
  return {
    trigger,
    valuePropName,
    getValueFromEvent,
    getValueProps
  };
}
