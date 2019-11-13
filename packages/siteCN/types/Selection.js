import React from "react";
import PropTypes from "prop-types";

const Selection = () => {
  return <div />;
};

Selection.defaultProps = {
  selectMode: "single",
  rowSelectClassName: "tablex__row--selected",
  defaultSelectedRowKeys: [],
  disabledSelectKeys: [],
  checkStrictly: true
};

Selection.propTypes = {
  /** 行选中时的样式类名 */
  rowSelectClassName: PropTypes.string,
  /** 选择模式：多选 单选 不可选择 */
  selectMode: PropTypes.oneOf(["multiple", "single", "none"]),

  /** 复选列配置 */
  selectionColumn: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 默认选中的行键值 */
  defaultSelectedRowKeys: PropTypes.array,

  /** 选中的行键值 */
  selectedRowKeys: PropTypes.array,
  /** 将被禁用选择的行key */
  disabledSelectKeys: PropTypes.array,
  /**
   * 行选择事件
   *  (selectedKeys,selectedRows,triggerKey) => void
   * */
  onSelectChange: PropTypes.func,

  /** 行选择前置事件,返回false取消选择操作 */
  onBeforeSelect: PropTypes.func,

  /** 行单选事件 */
  onSelect: PropTypes.func,
  /** 行单选取消事件 */
  onUnSelect: PropTypes.func,
  /** 全选事件 */
  onSelectAll: PropTypes.func,
  /** 取消全选事件 */
  onUnSelectAll: PropTypes.func,

  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool,

  /** 行选择配置 */
  rowSelection: PropTypes.shape({
    checkStrictly: PropTypes.bool,
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
    disabledCheckedKeys: PropTypes.array,
    selectedRowKeys: PropTypes.array,
    /** 行选择模式，支持checkbox多选状态下，行选择为单选 */
    selectType: PropTypes.oneOf(["single", "multiple"]),
    /** 是否允许点击选中行时，取消选中状态 */
    selectInverted: PropTypes.bool,
    /** 选择模式，单选、复选 */
    type: PropTypes.oneOf(["checkbox", "radio"]),
    /** 是否显示多选框列 */
    showCheckbox: PropTypes.bool,
    onBeforeSelect: PropTypes.func,
    onSelect: PropTypes.func,
    onSelectAll: PropTypes.func,
    onBeforeCheck: PropTypes.func,
    onBeforeCheckAll: PropTypes.func,
    onCheckAll: PropTypes.func,
    onChange: PropTypes.func
  })
};

export default Selection;
