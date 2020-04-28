import * as React from "react";

export type ValidateResult = { valid: boolean; message: string };

export type EditTools = [
  "edit" | "add" | "delete",
  { icon: string; text: string; props: {}; handler: (e: any) => void },
  (e: any) => React.ReactNode
];

export type EditToolsConfig = {
  position: "top" | "bottom";
  wrapper?: (el: React.ReactNode, type: any, api: object) => React.ReactNode;
  props: object;
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
  sortable?: boolean;
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
  colSpan: number;
  rowSpan: number;
  onCell: (row: object, rowIndex: number, extra: any) => object;
  onHeaderCell: (column: object) => object;
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
  showRefresh?: boolean;
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
export interface RowSelectionProps {
  areaSelectEnabled?: boolean;
  checkStrictly: boolean;
  columnTitle: string | Function | React.ReactNode;
  columnWidth: number;
  fixed: boolean;
  getCheckboxProps: Function;
  disabledCheckedKeys: Array<string>;
  selectedRowKeys: Array<string>;
  type: "checkbox" | "radio" | "none";
  selectType: "single" | "multiple" | "none";
  selectInverted: boolean;
  showCheckbox: boolean;
  selectOnCheck: boolean;
  checkOnSelect: boolean;
  onBeforeSelect: () => boolean;
  onSelect: () => void;
  onSelectAll: () => void;
  onCheck: () => void;
  onBeforeCheck: () => boolean;
  onBeforeCheckAll: () => void;
  onChange: () => void;
}

export interface TableProps<T> {
  rowKey: string;
  columns?: ColumnProps<T>[];
  data?: T[];
  rowHeight?: number | ((record: object, index: number) => number);
  headerRowHeight?: number[] | number;
  minHeight?: number;
  maxHeight?: number;
  autoHeight?: boolean;

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

  columnDropMenu?: boolean;
  columnDropMenuOptions?: {
    fixable: boolean;
    filterable: boolean;
    groupable: boolean;
  };
  contextMenu?: (row: any) => React.ReactNode;
  orderNumber?: false | null | ColumnProps<T>;
  pagination?: PaginationProps | false | null;
  showRefresh?: boolean;
  onRefresh?: (pageIndex, pageSize) => void;
  defaultGroupedColumnKey?: string[];
  groupedColumnKey?: string[];
  groupedColumnSummary?: {
    style?: object;
    className?: string;
    data: any[];
    render?: (text: string, value: any, d: any) => React.ReactNode;
  };
  resetScrollOffset?: boolean;
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
  selectOnRowClick?: boolean;
  rowSelectClassName?: string;
  defaultSelectedRowKeys?: string[];
  selectedRowKeys?: string[];
  disabledSelectKeys?: string[];
  onSelectChange?: (
    selectedKeys: string[],
    selectedRows: any[],
    triggerKey: string
  ) => void;
  onBeforeSelect?: ({
    selected: boolean,
    rowData: any,
    index: number,
    key: string
  }) => boolean;
  onBeforeSelectAll?: ({ selected: boolean }) => boolean;
  onSelect?: (record: object, index: number, rowKey: string) => void;
  onUnSelect?: (record: object, index: number, rowKey: string) => void;
  onSelectAll?: () => void;
  onUnSelectAll?: () => void;

  rowSelection?: RowSelectionProps;

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
  expandOnRowClick?: boolean;
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: T) => void;
  loadChildrenData?: (record: object) => Promise<T> | void;
  indentSize?: number;

  editable?: boolean;
  keyboardNavigation?: boolean;
  editorClickBubble?: boolean;
  showValidateMessage?: boolean;
  readOnly?: boolean;
  editTools?: EditTools;
  editToolsConfig?: EditToolsConfig;
  isAppend?: boolean;
  ignoreEmptyRow?: boolean;
  defaultAddCount?: number;

  validateTrigger: ["onChange" | "onBlur" | "onSave"];
  onBeforeAdd?: () => boolean;
  onAdd?: (addedData: object[], newData: object[], string: "add") => void;
  rowTemplate?: (index: number) => object;
  onCancel?: () => void;
  onBeforeEdit?: () => boolean;
  onEdit?: () => void;
  onBeforeDelete?: (selectedKeys: string[]) => boolean;
  onDelete?: () => void;
  dataControled?: boolean;
  onEditSave?: (
    changedRows: object[],
    newRows: object[],
    editType: "add" | "edit" | "delete"
  ) => Promise<T> | void;
  onComplete?: (modifiedData: {
    changed: any[];
    inserted: any[];
    deleted: any[];
    data: any[];
  }) => void;
  onValidate?: (bl: boolean) => void;
}

export default class Table<T> extends React.Component<TableProps<T>, any> {}
