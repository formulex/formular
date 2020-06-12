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
  renderTextContent?: TextContentRenderer<P> | true;
}

export interface TextContentRenderer<P> {
  (
    meta: FieldRenderableProps,
    renderConfig: RenderConfig,
    componentProps: P
  ): React.ReactNode;
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

export type ConnectedComponentProps<P> = P & {
  $meta: FieldRenderableProps;
  ref?: React.Ref<any>;
};

export function connect<P extends { [key: string]: any }>({
  trigger = 'onChange',
  valuePropName = 'value',
  getValueFromEvent = (e) => e.target.value,
  getValueProps = (value) => value,
  getDerivedPropsFromFieldMeta = (props) => props,
  renderTextContent
}: TransformOptions<P> = {}) {
  return function decorate(
    Component: React.ComponentType<P>
  ): React.ComponentType<ConnectedComponentProps<P>> {
    const DecoratedInnerComponent: React.FC<
      P & { forwardedRef: RefType<any> } & { $meta: FieldRenderableProps }
    > = ({ forwardedRef, $meta, ...rest }) => {
      const renderConfig = useRenderConfig();
      const { field } = $meta;
      const ownComponentProps = rest as P;

      // When show detail
      if (
        typeof renderTextContent === 'function' ||
        renderTextContent === true
      ) {
        if (field.plain === true) {
          const fn =
            typeof renderTextContent === 'function'
              ? renderTextContent
              : ((({ field }, { PreviewComponent = 'span', emptyContent }) => (
                  <PreviewComponent>
                    {field.value ?? emptyContent}
                  </PreviewComponent>
                )) as TextContentRenderer<P>);
          return <>{fn($meta, renderConfig, ownComponentProps)}</>;
        }
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
        <Component {...derivedProps} {...injectProps} ref={forwardedRef} />
      );
    };

    const name = Component.displayName || Component.name;
    DecoratedInnerComponent.displayName = `Connect(${name})`;

    const DecoratedComponent = observer(DecoratedInnerComponent);

    const forwardRef: React.ForwardRefRenderFunction<any, any> = (
      props,
      ref
    ) => <DecoratedComponent {...props} forwardedRef={ref} />;

    forwardRef.displayName = `forwardRefConnect(${name})`;

    return React.forwardRef<any, any>(forwardRef) as any;
  };
}
