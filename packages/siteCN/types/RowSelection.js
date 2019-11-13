import React from "react";
import PropTypes from "prop-types";

const RowSelection = () => {
  return <div />;
};

RowSelection.defaultProps = {
  selectMode: "single",
  rowSelectClassName: "tablex__row--selected",
  defaultSelectedRowKeys: [],
  disabledSelectKeys: [],
  checkStrictly: true
};

RowSelection.propTypes = {
  /** 多选框列标题 */
  columnTitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element
  ]),
  /** 多选框列宽 */
  columnWidth: PropTypes.number,
  /** 是否固定多选框列 */
  fixed: PropTypes.bool,
  /** 动态设置选择框属性 */
  getCheckboxProps: PropTypes.func,
  /** 选中的行key */
  selectedRowKeys: PropTypes.array,
  /** 选择模式，单选、复选 */
  type: PropTypes.oneOf(["checkbox", "radio"]),
  /** 手动选择/取消选择某行的回调 */
  onSelect: PropTypes.func,

  /** 全选事件 */
  onSelectAll: PropTypes.func,

  /** 选中项发生变化时的回调 */
  onChange: PropTypes.func,

  /** 是否显示多选框列 */
  showCheckbox: PropTypes.bool,

  /** 行选中时是否勾选 */
  selectOnCheck: PropTypes.bool,
  /** 勾选时是否同时选中行 */
  checkOnSelect: PropTypes.bool,
  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool,
  /** 禁用checkbox选择的行key */
  disabledCheckedKeys: PropTypes.array,

  /** 行选择模式，支持checkbox多选状态下，行选择为单选 */
  selectType: PropTypes.oneOf(["single", "multiple"]),
  /** 是否允许点击选中行时，取消选中状态 */
  selectInverted: PropTypes.bool,

  /** 选择前置事件 */
  onBeforeSelect: PropTypes.func,
  /** checkbox点击前置事件 */
  onBeforeCheck: PropTypes.func,
  /** 全选前置事件 */
  onBeforeCheckAll: PropTypes.func,
  /** 全选点击事件 */
  onCheckAll: PropTypes.func
};

export default RowSelection;
