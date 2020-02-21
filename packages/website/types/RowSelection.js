import React from "react";
import PropTypes from "prop-types";

const RowSelection = () => {
  return <div />;
};

RowSelection.defaultProps = {};

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
  /** 复选框勾选中的行key */
  checkedKeys: PropTypes.array,
  /** 选择模式，单选、复选、不可选 */
  type: PropTypes.oneOf(["checkbox", "radio", "none"]),
  /** 手动选择/取消选择某行的回调 */
  onSelect: PropTypes.func,
  /** 行全选事件 */
  onSelectAll: PropTypes.func,
  /** 行选中项发生变化时的回调 */
  onSelectChange: PropTypes.func,
  /** 勾选项全选事件 */
  onCheckAll: PropTypes.func,
  /** 勾选项发生变化时的回调 */
  onChange: PropTypes.func,
  /** 是否显示勾选框列 */
  showCheckbox: PropTypes.bool,
  /** 是否启用shift、拖拽区域快速选择，多选模式下生效 */
  areaSelectEnabled: PropTypes.bool,
  /** 行选中时是否勾选 */
  selectOnCheck: PropTypes.bool,
  /** 勾选时是否同时选中行 */
  checkOnSelect: PropTypes.bool,
  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool,
  /** 禁用checkbox选择的行key */
  disabledCheckedKeys: PropTypes.array,

  /** 行选择模式，支持checkbox勾选模式下，行选择为单选 */
  selectType: PropTypes.oneOf(["single", "multiple", "none"]),
  /** 是否允许点击选中行时，取消选中状态 */
  selectInverted: PropTypes.bool,

  /** 手动勾选/取消勾选某行的回调 */
  onCheck: PropTypes.func,

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
