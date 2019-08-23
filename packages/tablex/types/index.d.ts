import * as React from "react";

export type ValidateResult = { valid: boolean; message: string };

export type EditTools = [
  "edit" | "add" | "delete",
  { icon: string; text: string; props: {}; handler: (e: any) => void },
  (e: any) => React.ReactNode
];

export type EditToolsConfig = {
  position: "top" | "bottom";
  itemStyle: object;
  editText: string;
  editIcon: string;
  addText: string;
  addIcon: string;
  deleteText: string;
  deleteIcon: string;
  okText: string;
  okIcon: string;
  cancelText: string;
  cancelIcon: string;
};

export interface ColumnProps<T> {
  title?: React.ReactNode | (() => React.ReactNode);
  titleRender?: ({ colunm: T }) => React.ReactNode;
  key?: React.Key;
  dataIndex?: string;
  render?: (
    text: any,
    record: T,
    index: number,
    extra: { depth: number; parents: string[] }
  ) => React.ReactNode;
  align?: "left" | "right" | "center";
  halign?: "left" | "right" | "center";
  minWidth?: number;
  width?: string | number;
  fixed?: "left" | "right" | "none";

  hidden?: boolean;
  editingVisible?: boolean;
  settable?: boolean;
  dropMenu?: boolean;
  validator?: (text: any, record: T, index: number) => ValidateResult;
  editor?: (
    value: any,
    row: object,
    rowIndex: number,
    onchange: (e: any) => void,
    ref: (ins: any) => void,
    validate: () => void
  ) => React.ReactNode;
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

export interface FrozenRenderProps {
  rowHeight?: number;
  rowKey: string;
  top: any[];
  bottom: any[];
  rowRender: (props: object) => React.ReactNode;
  onRow?: (
    row: object,
    index: number,
    rowProps: object,
    position: "top" | "bottom"
  ) => object;
  onCell?: (row: object, rowIndex: number, extra: object) => object;
  cellRender?: (
    value: any,
    row: object,
    rowIndex: number,
    extra: object
  ) => React.ReactNode;
}

export interface SummaryProps {
  style?: object;
  title?: { text: string; column: string; render?: () => React.ReactNode };
  data: any[];
  render?: (
    value: any,
    dataIndex: string,
    type: string,
    index: number
  ) => React.ReactNode;
}

export interface TableProps<T> {
  rowKey: string;
  columns?: ColumnProps<T>[];
  data?: T[];
  rowHeight?: number | ((record: object, index: number) => number);

  rowClassName?: (record: T, index: number) => string;
  selectionColumn?: false | null | ColumnProps<T>;
  showHeader?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  components?: TableComponents;
  scrollRef?: (ref: React.ElementType) => void;
  innerRef?: (ref: React.ElementType) => void;
  rowRender?: ({
    rowData: object,
    rowIndex: number,
    children: any
  }) => React.ReactNode;
  onRow?: (record: T, index: number) => object;
  frozenRender?: FrozenRenderProps;

  minHeight?: number;
  columnDropMenu?: boolean;
  orderNumber?: false | null | ColumnProps<T>;
  pagination?: PaginationProps | false | null;
  loading?: boolean;
  settable?: boolean;
  striped?: boolean;
  tableId?: string;
  footerExtra?: () => React.ReactNode;
  summary?: SummaryProps;
  emptyRenderer?: ({ headerHeight: number }) => React.ReactNode;
  loadingRender?: ({ headerHeight: number }) => React.ReactNode;

  selectMode?: "multiple" | "single" | "none";
  checkStrictly?: boolean;
  rowSelectClassName?: string;
  defaultSelectedRowKeys?: string[];
  selectedRowKeys?: string[];
  disabledSelectKeys?: string[];
  onSelectChange?: (
    selectedKeys: string[],
    selectedRows: any[],
    triggerKey: string
  ) => void;
  onSelect?: (record: object, index: number, rowKey: string) => void;
  onUnSelect?: (record: object, index: number, rowKey: string) => void;
  onSelectAll?: () => void;
  onUnSelectAll?: () => void;

  expandColumnKey?: string;
  expandedRowRender?: (
    record: T,
    index: number,
    indent: number,
    expanded: boolean
  ) => React.ReactNode;
  expandRowHeight?: number | ((record: object, index: number) => number);
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: T) => void;
  loadChildrenData?: (record: object) => Promise<T> | void;

  editable?: boolean;
  readOnly?: boolean;
  editTools?: EditTools;
  editToolsConfig?: EditToolsConfig;
  isAppend?: boolean;
  defaultAddCount?: number;
  onEditSave?: (
    changedRows: object[],
    newRows: object[],
    editType: "add" | "edit" | "delete"
  ) => Promise<T> | void;
  allowSaveEmpty?: boolean;
  validateTrigger: ["onChange" | "onBlur" | "onSave"];
  onBeforeAdd?: () => boolean;
  onAdd?: (addedData: object[], newData: object[], string: "add") => void;
  rowTemplate?: (index: number) => object;
  onCancel?: () => void;
  onBeforeEdit?: () => boolean;
  onEdit?: () => void;
  onBeforeDelete?: (selectedKeys: string[]) => boolean;
  onDelete?: () => void;
  alwaysValidate?: boolean;
  dataControled?: boolean;
}

export default class Table<T> extends React.Component<TableProps<T>, any> {}
