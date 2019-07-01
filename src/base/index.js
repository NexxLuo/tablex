import React from "react";
import BaseTable from "./BaseTable";
import PropTypes from "prop-types";

/**
 * 表格组件
 */
const Table = props => {
  return <BaseTable {...props} />;
};

Table.defaultProps = {
  rowKey: "key",
  columns: [],
  dataSource: [],
  selectMode: "single",
  disabledSelectKeys: [],
  orderNumber: false,
  checkStrictly: true,
  resizable: true,
  showHeader: true,
  striped: true,
  bordered: true,
  rowHeight: 40,
  rowSelectClassName: "tablex__row--selected",
  expandColumnKey: ""
};

Table.propTypes = {
  /** 数据行主键字段 */
  rowKey: PropTypes.string.isRequired,
  /** 列 */
  columns: PropTypes.array.isRequired,
  /** 行数据源 */
  dataSource: PropTypes.array,

  /** table实例回调
   * (ins:React.Element) => void
   */
  initRef: PropTypes.func,

  /** 是否显示边框 */
  bordered: PropTypes.bool,

  /** 奇偶行颜色间隔 */
  striped: PropTypes.bool,
  /** 是否显示表头 */
  showHeader: PropTypes.bool,

  /** 行高 */
  rowHeight: PropTypes.number,

  /** 行选中时的样式类名 */
  rowSelectClassName: PropTypes.string,

  /**
   * 行事件对象
   *  {onClick:({ rowData, rowIndex, rowKey, event })=>{},...}
   * */
  rowEventHandlers: PropTypes.object,

  /** 选择模式：多选 单选 不可选择 */
  selectMode: PropTypes.oneOf(["multiple", "single", "none"]),
  /** 选中的行键值 */
  selectedRowKeys: PropTypes.array,
  /** 将被禁用选中的行key */
  disabledSelectKeys: PropTypes.array,
  /**
   * 行选择事件
   *  (selectedKeys,selectedRows,triggerKey) => void
   * */
  onSelectChange: PropTypes.func,
  /** 是否显示序号列 */
  orderNumber: PropTypes.bool,
  /** 列是否可设置宽度，优先级小于column.resizable */
  resizable: PropTypes.bool,
  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool,

  /** 展开按钮所在的列 */
  expandColumnKey: PropTypes.string,

  /** 展开的行键值 */
  expandedRowKeys: PropTypes.array,
  /**
   * 行展开事件
   * (expandedRowKeys:Array) => void
   * */
  onExpandedRowsChange: PropTypes.func,

  /**
   * 展开时加载children的方法
   * (row:object) => Promise
   * */
  loadChildrenData: PropTypes.func
};

export default Table;
