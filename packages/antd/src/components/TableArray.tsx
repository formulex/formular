import React from 'react';
import { RenderComponentProps } from '../layout-components';
import { Table } from 'antd';
import { invariant } from '@formular/core';
import { Observer, observer } from 'mobx-react';
import type { ColumnType } from 'antd/es/table';

export interface TableArrayProps {
  renderAfter?: (
    props: RenderComponentProps<TableArrayProps>
  ) => React.ReactNode;
  enhanceColumns?: (
    columns: ColumnType<any>[],
    props: RenderComponentProps<TableArrayProps>
  ) => ColumnType<any>[];
}

const rowKey = (_: any, index?: number) => index!;

export const TableArray: React.FC<RenderComponentProps<
  TableArrayProps
>> = observer((props) => {
  const {
    $meta,
    mapPropsToShow,
    children,
    renderAfter,
    enhanceColumns,
    ...antdProps
  } = props;
  invariant(
    $meta.type === 'array',
    `TableArray must be used with type="array" in component "${$meta.field.name}"`
  );
  const columns =
    React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return null;
      }
      const {
        props: { name, label }
      } = child;
      return {
        key: name,
        title: label,
        dataIndex: name,
        render: (_, __, index) => {
          const fieldName = `${$meta.field.name}[${index}].${child.props.name}`;
          return (
            <Observer>
              {() =>
                React.cloneElement(child, {
                  ...child.props,
                  name: fieldName,
                  label: undefined,
                  editable: $meta.field.editable
                })
              }
            </Observer>
          );
        }
      } as ColumnType<any>;
    })?.filter((_) => _) ?? [];

  const baseDataSource = $meta.field.value ?? [];
  const dataSource = baseDataSource.map((obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      return obj;
    } else {
      return {};
    }
  });
  return (
    <>
      <Table
        {...antdProps}
        dataSource={dataSource}
        rowKey={rowKey}
        columns={enhanceColumns?.(columns, props) ?? columns}
      />
      {renderAfter?.(props)}
    </>
  );
});
