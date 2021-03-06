import React from "react";
import PropTypes from "prop-types";

const Column = () => {
  return <div />;
};

Column.defaultProps = {
  title: "",
  width: undefined,
  key: "",
  dataIndex: "",
  resizable: true
};

Column.propTypes = {
  /** 列标题 */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /** 列标题自定义渲染，优先级高于title，但是不会覆盖column dropmenu下的title */
  titleRender: PropTypes.func,
  /** 列对齐方式 */
  align: PropTypes.oneOf(["left", "right", "center"]),
  /** 列标题对齐方式 */
  halign: PropTypes.oneOf(["left", "right", "center"]),
  /** 最小列宽 */
  minWidth: PropTypes.number,
  /** 列宽,如果不设置宽度，列宽将会自动占满剩余宽度 */
  width: PropTypes.number,
  /** 列唯一key，如若不设置，将会以dataIndex作为唯一key */
  key: PropTypes.string.isRequired,
  /** 列数据字段 */
  dataIndex: PropTypes.string,
  /** 冻结列 */
  fixed: PropTypes.oneOf(["left", "right"]),
  /** 是否可拖动宽度 */
  resizable: PropTypes.bool,
  /** 列自定义渲染 */
  render: PropTypes.func,
  /** 编辑列验证  (value,row,rowIndex) => React.Element ;
   */
  validator: PropTypes.func,
  /** 编辑列控件 (value:any,row:object,rowIndex:number,onchange:func,ref:func,validate:func) => React.Element ;
   */
  editor: PropTypes.func,

  /** 列是否隐藏 */
  hidden: PropTypes.bool,

  /** 编辑时列是否可见 */
  editingVisible: PropTypes.bool,

  /** 列是否可配置属性 */
  settable: PropTypes.bool,

  /** 列是否显示列属性下拉菜单 */
  dropMenu: PropTypes.bool,

  /** 表头列合并 */
  colSpan: PropTypes.number,

  /** 表头行合并 */
  rowSpan: PropTypes.number,

  /** 设置单元格属性 */
  onCell: PropTypes.func,

  /** 设置表头单元格属性 */
  onHeaderCell: PropTypes.func
};

export default Column;
