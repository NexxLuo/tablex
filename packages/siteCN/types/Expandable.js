import React from "react";
import PropTypes from "prop-types";

const Expandable = () => {
  return <div />;
};

Expandable.defaultProps = {
  expandColumnKey: "",
  expandRowHeight: 100,
  defaultExpandedRowKeys: [],
  indentSize: 20
};

Expandable.propTypes = {
  /** 展开行渲染 */
  expandedRowRender: PropTypes.func,

  /** 展开行高度 */
  expandRowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

  /** 展开按钮所在的列 */
  expandColumnKey: PropTypes.string,

  /** 每层展开子级的缩进宽度 */
  indentSize: PropTypes.number,

  /** 默认展开的行 */
  defaultExpandedRowKeys: PropTypes.array,

  /** 展开的行键值 */
  expandedRowKeys: PropTypes.array,
  /**
   * 行展开事件
   * (expandedRowKeys:Array) => void
   * */
  onExpandedRowsChange: PropTypes.func,

  /**
   * 点击展开图标时触发
   */
  onExpand: PropTypes.func,

  /**
   * 展开时加载children的方法
   * (row:object) => Promise
   * */
  loadChildrenData: PropTypes.func
};

export default Expandable;
