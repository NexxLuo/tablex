import React from "react";
import PropTypes from "prop-types";

/**
 * 表格组件
 */
const Table = props => {
  return <div {...props} />;
};

Table.defaultProps = {
  rowKey: "key",
  columns: [],
  data: [],
  orderNumber: false,
  showHeader: true,
  striped: true,
  bordered: true,
  rowHeight: 40
};

Table.propTypes = {
  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired,

  /**
   * 表格列
   */
  columns: PropTypes.array.isRequired,

  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,

  /** 额外前置添加的列 */
  prependColumns: PropTypes.array,

  /** 行高 */
  rowHeight: PropTypes.number,

  /** 自定义行样式 */
  rowClassName: PropTypes.func,

  /** 是否显示表头 */
  showHeader: PropTypes.bool,

  /** 是否显示边框 */
  bordered: PropTypes.bool,

  /** 鼠标hover样式 */
  hoverable: PropTypes.bool,

  /**
   * 覆盖table元素，如：components:{row:func}
   */
  components: PropTypes.object,

  /** 获取数据滚动区域ref */
  scrollRef: PropTypes.func,

  /** 自定义行内渲染 */
  rowRender: PropTypes.func,

  /** 自定义行属性，可处理行事件 */
  onRow: PropTypes.func
};

export default Table;
