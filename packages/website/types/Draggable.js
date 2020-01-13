import React from "react";
import PropTypes from "prop-types";

const Draggable = () => {
  return <div />;
};

Draggable.defaultProps = {
  allowDragLevel: true,
  useDragHandle: false,
  dragHandleSelector: ""
};

Draggable.propTypes = {
  /** 是否允许拖动层级 */
  allowDragLevel: PropTypes.bool,
  /** 是否使用拖动按钮，此按钮将独占一列 */
  useDragHandle: PropTypes.bool,
  /** 拖动按钮渲染,useDragHandle:true时有效 */
  dragHandleRender: PropTypes.func,
  /** 拖动按钮元素选择器,useDragHandle:false时有效，将会在当前行元素内查找此选择器 */
  dragHandleSelector: PropTypes.string,

  /** 行是否允许拖动,返回false阻止拖拽 */
  canDrag: PropTypes.func,
  /** 拖动开始事件 */
  onDragBegin: PropTypes.func,
  /** 拖动结束事件 */
  onDragEnd: PropTypes.func,

  /** 是否允许放置,返回false阻止放置 */
  canDrop: PropTypes.func,
  /** 放置hover事件 */
  onDropHover: PropTypes.func,
  /** 放置完成事件 */
  onDrop: PropTypes.func,

  /** 拖动、放置完成事件，此事件中返回拖动后的新数据 */
  onDragComplete: PropTypes.func,
  /** 获取表格实例 */
  tableRef: PropTypes.func
};

export default Draggable;
