import React from 'react';
import { Form as AntDesignForm } from 'antd';
import {
  Item as InnerItem,
  ItemProps as InnerItemProps,
  FieldRenderableProps
} from '@formular/react';
import type { FormItemProps as AntDesignFormItemProps } from 'antd/lib/form/FormItem';

type InnerItemPropsType = Omit<InnerItemProps, 'render' | 'children'>;

type ExplicitInnerItemProps = Pick<
  InnerItemPropsType,
  'name' | 'initialValue' | 'rule' | 'asyncRule' | 'editable'
>;

export interface FieldProps<P>
  extends ExplicitInnerItemProps,
    Omit<AntDesignFormItemProps, keyof ExplicitInnerItemProps | 'children'> {
  $itemMetaProps?: InnerItemPropsType;
  component: React.ComponentType<P & { $meta: FieldRenderableProps }>;
  componentProps?: P;
  addonAfter?: React.ReactNode;
}

export interface MapFieldsMetaToItemPropsFrom {
  (meta: FieldRenderableProps): { [key: string]: any };
}

const validateMapper: { [key: string]: any } = {
  PENDING: 'validating',
  VALID: 'success',
  INVALID: 'error',
  WARNING: 'warning',
  IGNORED: 'default'
};

const mapper: MapFieldsMetaToItemPropsFrom = ({
  fields,
  field,
  form,
  type
}) => {
  if (type === 'array') {
    console.log(fields);
    return {};
  }
  return {
    validateStatus:
      ((field.modified || form.everValitated) &&
        validateMapper[field.validation.status]) ||
      undefined,
    help:
      (field.modified || form.everValitated) &&
      field.validation.messages.join(', ')
  };
};

export class Field<P> extends React.Component<FieldProps<P>> {
  render() {
    const {
      $itemMetaProps,
      component,
      componentProps,
      name,
      initialValue,
      rule,
      asyncRule,
      editable,
      addonAfter,
      style,
      ...restProps
    } = this.props;
    return (
      <InnerItem
        {...$itemMetaProps}
        {...{ name, initialValue, rule, asyncRule, editable }}
      >
        {(meta) => {
          const innerComponentProps = {
            ...componentProps,
            $meta: meta
          };
          const innerChildren = React.createElement(
            component as React.ComponentType<typeof innerComponentProps>,
            innerComponentProps
          );
          const extraStyle = { display: 'none' };
          if (meta.field.show) {
            delete extraStyle.display;
          }
          return (
            <AntDesignForm.Item
              {...restProps}
              style={{ ...style, ...extraStyle }}
              {...mapper(meta)}
            >
              {addonAfter ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {innerChildren}
                  {addonAfter}
                </div>
              ) : (
                innerChildren
              )}
            </AntDesignForm.Item>
          );
        }}
      </InnerItem>
    );
  }
}
