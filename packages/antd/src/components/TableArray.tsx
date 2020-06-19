import React from 'react';
import { Field } from '../layout-components';
import { invariant } from '@formular/core';
import { Observer } from 'mobx-react';
import AntdTable, { ColumnType, TableProps } from 'antd/lib/table';
import { connect, FieldArrayMeta, FieldEntryProps } from '@formular/react';
import { FormItemProps } from 'antd/lib/form/FormItem';

const rowKey = ({ index }: { index: number }) => index!;

export interface XTableProps
  extends TableProps<{ name: string; index: number }> {
  itemFields?: Array<FieldEntryProps<FormItemProps, any> & { width?: any }>;
  enhanceColumns?: (
    columns: ColumnType<any>[],
    source: { componentProps: XTableProps; meta: FieldArrayMeta }
  ) => ColumnType<any>[];
}

export const TableArray = connect<XTableProps>({
  getDerivedPropsFromFieldMeta({ componentProps, meta }) {
    const { field, type } = meta;
    invariant(
      type === 'array',
      `TableArray must be used with type="array" in component "${field.name}"`
    );
    const { fields } = meta as FieldArrayMeta;
    const dataSource = fields.map((name, index) => ({ name, index }));
    const columns = (componentProps.itemFields ?? []).map((props) => {
      const { name, label, width } = props;
      return {
        key: name,
        title: label,
        dataIndex: name,
        width,
        render: (_: any, source: any) => {
          return (
            <Observer>
              {() => (
                <Field
                  {...props}
                  name={`${source.name}.${name}`}
                  label={undefined}
                  plain={field.plain}
                />
              )}
            </Observer>
          );
        }
      };
    });

    return {
      ...componentProps,
      columns:
        componentProps?.enhanceColumns?.(columns, {
          componentProps,
          meta: meta as FieldArrayMeta
        }) ?? columns,
      dataSource,
      loading: field.loading ?? componentProps.loading,
      rowKey
    };
  }
})(AntdTable);
