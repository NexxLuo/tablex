import * as React from "react";

export type Align = number | string;

export interface ColumnProps<T> {
  title?: React.ReactNode | (() => React.ReactNode);
  key?: React.Key;
  dataIndex?: string;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
  fixed?: "left" | "right" | "none";
}

export interface TableComponents {
  row?: React.ReactType;
  head?: React.ReactType;
  body?: React.ReactType;
}

export interface PaginationProps {
  total?: number;
  defaultCurrent?: number;
  disabled?: boolean;
  current?: number;
  defaultPageSize?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize?: number) => void;
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  onShowSizeChange?: (current: number, size: number) => void;
  showQuickJumper?: boolean | { goButton?: React.ReactNode };
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  size?: string;
  simple?: boolean;
  style?: React.CSSProperties;
  locale?: Object;
  className?: string;
  prefixCls?: string;
  selectPrefixCls?: string;
  itemRender?: (
    page: number,
    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
    originalElement: React.ReactElement<HTMLElement>
  ) => React.ReactNode;
  role?: string;
  showLessItems?: boolean;
}

export interface TableProps<T> {
  prefixCls?: string;
  dropdownPrefixCls?: string;
  pagination?: PaginationProps | false;
  data?: T[];
  components?: TableComponents;
  columns?: ColumnProps<T>[];
  rowKey?: string;
  rowClassName?: (record: T, index: number) => string;
  expandedRowRender?: (
    record: T,
    index: number,
    indent: number,
    expanded: boolean
  ) => React.ReactNode;
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: T) => void;
  loading?: boolean;
  onRow?: (record: T, index: number) => object;
  bordered?: boolean;
  showHeader?: boolean;
  footer?: () => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default class Table<T> extends React.Component<TableProps<T>, any> {}
