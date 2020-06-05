import React from 'react';
import { observer } from 'mobx-react';
import { FieldRenderableProps } from '../components';
import { useRenderConfig } from '../contexts';
import { RenderConfig } from '../contexts/RenderContext';

type RefType<T> = Parameters<React.ForwardRefRenderFunction<T>>[1];

export interface TransformOptions<P> {
  trigger?: string;
  valuePropName?: string;
  getValueFromEvent?: (...args: any[]) => any;
  getValueProps?: (value: any) => any;
  getDerivedPropsFromFieldMeta?: (
    componentProps: P,
    meta: FieldRenderableProps
  ) => P;
  renderTextContent?: (
    meta: FieldRenderableProps,
    renderConfig: RenderConfig,
    componentProps: P
  ) => React.ReactNode;
}

export function remainOwnEventHandler(
  ownEventHandler: undefined | ((...args: any[]) => void),
  action: (...args: any[]) => void
) {
  return function handler(...args: any[]) {
    action(...args);
    ownEventHandler?.(...args);
  };
}

export function connect<P extends { [key: string]: any }>({
  trigger = 'onChange',
  valuePropName = 'value',
  getValueFromEvent = (e) => e.target.value,
  getValueProps = (value) => value,
  getDerivedPropsFromFieldMeta = (props) => props,
  renderTextContent = (
    { field },
    { PreviewComponent = 'span', emptyContent }
  ) => <PreviewComponent>{field.value ?? emptyContent}</PreviewComponent>
}: TransformOptions<P> = {}) {
  return function decorate(Component: React.ComponentType<P>) {
    const DecoratedInnerComponent: React.FC<
      P & { forwardedRef: RefType<any> } & { $meta: FieldRenderableProps }
    > = ({ forwardedRef, $meta, ...rest }) => {
      const renderConfig = useRenderConfig();
      const { field } = $meta;
      const ownComponentProps = rest as P;

      // When show detail
      if (!field.editable) {
        return <>{renderTextContent($meta, renderConfig, ownComponentProps)}</>;
      }

      const injectProps = {
        // onChange
        [trigger]: remainOwnEventHandler(
          ownComponentProps[trigger],
          (...args: any[]) => {
            field.setValue(getValueFromEvent(...args));
          }
        ),

        // value
        [valuePropName]: getValueProps(field.value),

        // focus
        onFocus: remainOwnEventHandler(ownComponentProps.onFocus, () => {
          field.focus();
        }),

        // blur
        onBlur: remainOwnEventHandler(ownComponentProps.onBlur, () => {
          field.blur();
        })
      };

      const derivedProps = getDerivedPropsFromFieldMeta(
        ownComponentProps as P,
        $meta
      );
      return (
        <Component ref={forwardedRef} {...derivedProps} {...injectProps} />
      );
    };

    const DecoratedComponent = observer(DecoratedInnerComponent);

    const forwardRef: React.ForwardRefRenderFunction<any, any> = (
      props,
      ref
    ) => <DecoratedComponent {...props} forwardedRef={ref} />;

    const name = Component.displayName || Component.name;
    forwardRef.displayName = `connect(${name})`;

    return React.forwardRef(forwardRef);
  };
}
