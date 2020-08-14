import React from 'react';
import { FieldInstance, FormInstance } from '@formular/core';
import { usePlainConfig } from '../hook/usePlainConfig';
import { observer } from 'mobx-react';

export interface ProxyControlledPropsOptions {
  onChangeTrigger?: string;
  valuePropName?: string;
  retrieveValueFromEvent?: (...args: any[]) => any;
  getValueProps?: (value: any) => any;
}

export interface Source {
  field: FieldInstance;
  form: FormInstance;
}

export type AtomFieldComponentProps<P> = P & {
  $source: Source;
};

export interface MapFieldToProps<P> {
  (source: Source, ownProps: P): P;
}
export function defaultMapFieldToProps<P>(source: Source, ownProps: P): P {
  return {
    ...ownProps
  };
}

export interface RenderPlainFn<P> {
  (source: Source, ownProps: P): React.ReactNode;
}

export interface AsAtomFieldHOC<P> {
  (mapFieldToProps: MapFieldToProps<P>): any;
  (
    mapFieldToProps: MapFieldToProps<P>,
    proxyControlledOptions: ProxyControlledPropsOptions
  ): any;
  (
    mapFieldToProps: MapFieldToProps<P>,
    renderPlain: RenderPlainFn<P>,
    proxyControlledOptions: ProxyControlledPropsOptions
  ): any;
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

export type AtomFieldHOC<P> = (
  Component: React.ComponentType<P>
) => React.ComponentType<AtomFieldComponentProps<P>>;

export function asAtomField<P extends Record<string, any>>(): AtomFieldHOC<P>;
export function asAtomField<P extends Record<string, any>>(
  mapFieldToProps: MapFieldToProps<P>
): AtomFieldHOC<P>;
export function asAtomField<P extends Record<string, any>>(
  mapFieldToProps: MapFieldToProps<P>,
  proxyControlledOptions: ProxyControlledPropsOptions
): AtomFieldHOC<P>;
export function asAtomField<P extends Record<string, any>>(
  mapFieldToProps: MapFieldToProps<P>,
  renderPlain: RenderPlainFn<P>
): AtomFieldHOC<P>;
export function asAtomField<P extends Record<string, any>>(
  mapFieldToProps: MapFieldToProps<P>,
  renderPlain: RenderPlainFn<P>,
  proxyControlledOptions: ProxyControlledPropsOptions
): AtomFieldHOC<P>;
export function asAtomField<P extends Record<string, any>>(
  mapFieldToProps?: MapFieldToProps<P>,
  renderPlainOrProxyControlledOptions?:
    | RenderPlainFn<P>
    | ProxyControlledPropsOptions,
  proxyControlledOptions?: ProxyControlledPropsOptions
): AtomFieldHOC<P> {
  const fianlMapFieldToProps = mapFieldToProps ?? defaultMapFieldToProps;
  const {
    onChangeTrigger = 'onChange',
    valuePropName = 'value',
    retrieveValueFromEvent = (e: any) => e.target.value,
    getValueProps = (value: any) => value
  } =
    proxyControlledOptions ??
    (typeof renderPlainOrProxyControlledOptions === 'object' &&
    renderPlainOrProxyControlledOptions !== null
      ? renderPlainOrProxyControlledOptions
      : undefined) ??
    {};
  return (
    Component: React.ComponentType<P>
  ): React.ComponentType<AtomFieldComponentProps<P>> => {
    const DecoratedInnerComponent: React.FC<
      P & { forwardedRef: React.Ref<any> } & { $source: Source }
    > = ({ forwardedRef, $source, ...rest }) => {
      const plainConfig = usePlainConfig();
      const { field } = $source;
      const ownComponentProps = rest as P;

      if (field.plain === true) {
        const renderFn =
          typeof renderPlainOrProxyControlledOptions === 'function'
            ? renderPlainOrProxyControlledOptions
            : ((({ field }) => {
                const finalEmptyContent =
                  typeof plainConfig.emptyContent === 'function'
                    ? plainConfig.emptyContent($source, ownComponentProps)
                    : plainConfig.emptyContent;
                return <span>{field.value ?? finalEmptyContent}</span>;
              }) as RenderPlainFn<P>);
        return <>{renderFn($source, ownComponentProps)}</>;
      }

      const proxyProps = {
        [onChangeTrigger]: remainOwnEventHandler(
          ownComponentProps[onChangeTrigger],
          (...args: any[]) => {
            field.change(retrieveValueFromEvent(...args));
          }
        ),
        [valuePropName]: getValueProps(field.value),
        onFocus: remainOwnEventHandler(ownComponentProps.onFocus, () => {
          field.focus();
        }),
        onBlur: remainOwnEventHandler(ownComponentProps.onBlur, () => {
          field.blur();
        })
      };

      const derivedProps = fianlMapFieldToProps($source, ownComponentProps);

      return <Component {...derivedProps} {...proxyProps} ref={forwardedRef} />;
    };

    const name = Component.displayName || Component.name;
    DecoratedInnerComponent.displayName = `AtomField(${name})`;

    const DecoratedComponent = observer(DecoratedInnerComponent);

    const forwardRef: React.ForwardRefRenderFunction<any, any> = (
      props,
      ref
    ) => <DecoratedComponent {...props} forwardedRef={ref} />;
    forwardRef.displayName = `forwardRefAtomField(${name})`;

    return React.forwardRef<any, any>(forwardRef) as any;
  };
}
