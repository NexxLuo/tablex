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

export interface ColumnProps {
  [propName: string]: any;
  title?: React.ReactNode | (() => React.ReactNode);
  titleRender?: ({ colunm: any }) => React.ReactNode;
  key?: React.Key;
  dataIndex?: string;
  render?: (
    text: any,
    record: any,
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
  resizable?: boolean;
  dropMenu?: boolean;
  visibleSettable?: boolean;
  validator?: (text: any, record: any, index: number) => ValidateResult;
  editor?: (
    value: any,
    row: object,
    rowIndex: number,
    onchange: (e: any) => void,
    ref: (ins: any) => void,
    validate: () => void
  ) => React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  onCell?: (row: object, rowIndex: number, extra: any) => object;
  onHeaderCell?: (column: object) => object;
}

export interface TableComponents {
  row?: React.ElementType;
  head?: React.ElementType;
  body?: React.ElementType;
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
  fixed?: boolean;
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
  onBeforeSelect: (params: any) => boolean;
  onSelect: (
    row: any,
    selected: boolean,
    selectedRows: any[],
    extra: any
  ) => void;
  onUnSelect: (
    row: any,
    selected: boolean,
    selectedRows: any[],
    extra: any
  ) => void;
  onSelectChange: (keys: string[], rows: any[], extra: any) => void;
  onSelectAll: (selected: boolean, rows: any[], changed: any[]) => void;
  onCheck: (row: any, checked: boolean, checkedRows: any[], extra: any) => void;
  onBeforeCheck: (params: any) => boolean;
  onCheckChange: (keys: string[], rows: any[], extra: any) => void;
  onCheckAll: (checked: boolean, rows: any[], changed: any[]) => void;
  onBeforeCheckAll: (params: any) => boolean;
  onChange: (keys: string[], rows: any[], extra: any) => void;
}

export interface TableProps {
  rowKey: string;
  columns?: ColumnProps[];
  data?: any[];
  rowHeight?: number | ((record: object, index: number) => number);
  headerRowHeight?: number[] | number;
  minHeight?: number;
  maxHeight?: number;
  autoHeight?: boolean;
  autoRowHeight?: boolean;
  className?: string;
  virtual?: boolean;

  rowClassName?: (record: any, index: number) => string;
  selectionColumn?: false | null | ColumnProps;
  selectionColumnKey?: string;
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
  onRow?: (record: any, index: number) => object;
  frozenRender?: FrozenRenderProps;
  onCell?: (row: object, rowIndex: number, extra: object) => object;

  columnDropMenu?: boolean;
  columnConfigHiddenControled?: boolean;
  onColumnConfigChange?: (key: string, config: any) => void;
  onColumnHiddenChange?: (key: string, hidden: boolean) => void;
  getColumnDropMenuColumns?: (
    allColumns: any[],
    currentMenuColumns: any[]
  ) => any;
  columnDropMenuOptions?: {
    fixable: boolean;
    filterable: boolean;
    groupable: boolean;
  };
  contextMenu?: (row: any) => React.ReactNode;
  orderNumber?: false | null | ColumnProps;
  pagination?: PaginationProps | false | null;
  showRefresh?: boolean;
  onRefresh?: (pageIndex, pageSize) => void;
  defaultGroupedColumnKey?: string[];
  groupedColumnKey?: string[];
  autoRowSpanColumns?: string[];
  groupedColumnSummary?: {
    style?: object;
    className?: string;
    data: any[];
    render?: (text: string, value: any, d: any) => React.ReactNode;
  };
  resetScrollOffset?: boolean;
  loading?: boolean;
  settable?: boolean;
  sortable?: boolean;
  striped?: boolean;
  tableId?: string;
  footerExtra?: () => React.ReactNode;
  header?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  summary?: SummaryProps;
  emptyRenderer?: ({ headerHeight: number }) => React.ReactNode;
  loadingRender?: ({ headerHeight: number }) => React.ReactNode;
  memorizeSortedColumns?: boolean;
  memorizePageSize?: boolean;
  onMount?: (pageIndex, pageSize) => void;

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
    record: any,
    index: number,
    indent: number,
    expanded: boolean
  ) => React.ReactNode;
  onSetExpandedRowRender?: (record: any, index: number) => boolean;
  expandRowHeight?: number | ((record: object, index: number) => number);
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  expandOnRowClick?: boolean;
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: any) => void;
  loadChildrenData?: (record: object) => Promise<any> | void;
  indentSize?: number;

  editable?: boolean;
  keyboardNavigation?: boolean;
  editorClickBubble?: boolean;
  showValidateMessage?: boolean;
  readOnly?: boolean;
  editTools?: EditTools;
  editToolsConfig?: EditToolsConfig;
  extraTools?: (ins: any) => React.ReactNode;
  edittingToolsShowType?: 0 | 1 | 2 | 3;
  intl?: any;
  isAppend?: boolean;
  ignoreEmptyRow?: boolean;
  defaultAddCount?: number;

  validateTrigger?: "onChange" | "onBlur" | "onSave";
  validateDelay?: number;
  alwaysValidate?: boolean;
  alwaysSave?: boolean;
  addAsChanged?: boolean;
  validateNoEditting?: boolean;
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
  ) => Promise<any> | void;
  onBeforeSave?: () => boolean;
  onComplete?: (modifiedData: {
    changed: any[];
    inserted: any[];
    deleted: any[];
    data: any[];
  }) => void;
  onValidate?: (bl: boolean) => void;
  actions?: any;
  columnOptions?: {
    [columnKey: string]: {
      visible?: boolean;
      disabled?: boolean;
      required?: boolean;
    };
  };
  singleRowEdit?: boolean;
  singleRowEditTrigger?: "none" | "onClick" | "onDoubleClick";
  onEditRowChange?: (rowKeys: string[], event: any) => void;
}

declare class Table extends React.Component<TableProps, any> {}

export declare function flatten(
  arr: any[],
  removeChildren?: boolean
): { list: any[]; leafs: any[]; roots: any[] };

export declare function unflatten(
  flatData: any[],
  idField: string,
  pidField: string,
  rootKey?: string
): any[];

export default Table;

export type DraggableTablePropsType = TableProps & {
  /** 是否允许拖动层级 */
  allowDragLevel?: boolean;
  /** 是否使用拖动按钮，此按钮将独占一列 */
  useDragHandle?: boolean;
  /** 拖动按钮渲染,useDragHandle:true时有效 */
  dragHandleRender?: (props: any) => React.ElementType;
  /** 拖动按钮元素选择器,useDragHandle:false时有效，将会在当前行元素内查找此选择器 */
  dragHandleSelector?: string;

  /** 行是否允许拖动,返回false阻止拖拽 */
  canDrag?: (props: any) => boolean;
  /** 拖动开始事件 */
  onDragBegin?: (props: any) => void;
  /** 拖动结束事件 */
  onDragEnd?: (props: any) => void;

  /** 是否允许放置,返回false阻止放置 */
  canDrop?: (props: any) => void;
  /** 放置hover事件 */
  onDropHover?: (props: any) => void;
  /** 放置完成事件 */
  onDrop?: (props: any) => void;

  /** 拖动、放置完成事件，此事件中返回拖动后的新数据 */
  onDragComplete?: (props: any) => void;
  /** 获取表格实例 */
  tableRef?: (innerTableRef: any) => void;
};

declare class DraggableTable extends React.Component<
  DraggableTablePropsType,
  any
> {}

export { Table, DraggableTable };
