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
  rowHeight: 40,
  headerRowHeight:40,
  virtual: true,
  autoHeight: false
};

Table.propTypes = {
  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired,

  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,

  /** 表格列 */
  columns: PropTypes.array,

  /** 行高 */
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

  /** 表头行高 */
  headerRowHeight: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number
  ]),

  /** 是否自动高度，为true时表格的高度将会随行数而变化 */
  autoHeight: PropTypes.bool,

  /** 自动行高度,此选项一定程度下会牺牲一些性能 */
  autoRowHeight: PropTypes.bool,

  /** 表格区域最小高度 */
  minHeight: PropTypes.number,

  /** 表格区域最大高度 */
  maxHeight: PropTypes.number,

  /** 是否启用虚拟加载 */
  virtual: PropTypes.bool,

  /** 虚拟加载时，额外渲染的数据行数 */
  overscanCount: PropTypes.number,

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

  /** 获取内部表格ref */
  innerRef: PropTypes.func,

  /** 自定义行内渲染 */
  rowRender: PropTypes.func,

  /** 自定义行属性，可处理行事件 */
  onRow: PropTypes.func,

  /** 选择功能配置，配置项详情见下方 */
  rowSelection: PropTypes.object
};

export default Table;
