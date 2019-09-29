import React from "react";
import PropTypes from "prop-types";
import Table from "../Editable";
import DraggableRow from "./DraggableRow";
import ReactDom from "react-dom";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import DragIcon from "./DragIcon";
import { treeToList, getTreeFromFlatData, cloneData } from "../utils";

import "./styles.css";

const arrayMove = (array, from, to) => {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
};

function DraggableTableRow(props) {
  let {
    rowData,
    rowIndex,
    rowKey,
    rowProps,
    getContainer,
    rowExtra,
    dragOptions
  } = props;
  return (
    <DraggableRow
      {...rowProps}
      getContainer={getContainer}
      itemInfo={rowExtra}
      itemKey={rowKey}
      data={rowData}
      index={rowIndex}
      dragOptions={dragOptions}
    />
  );
}

class Draggable extends React.Component {
  tableRef = React.createRef(null);
  constructor(props) {
    super(props);
    this.state = { data: [], rowKey: "" };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let data = nextProps.data || nextProps.dataSource || [];
      let nextState = {
        prevProps: nextProps,
        rowKey: nextProps.rowKey,
        data: data
      };
      return nextState;
    }

    return null;
  }

  componentDidMount() {
    if (typeof this.props.tableRef === "function") {
      this.props.tableRef(this.tableRef.current);
    }
  }

  getContainer = () => {
    let el = ReactDom.findDOMNode(this);
    return el.querySelector(".tablex-container");
  };

  isTree = () => {
    let { data } = this.state;
    let bl = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].children) {
        bl = true;
        break;
      }
    }
    return bl;
  };

  onDrop = (result, monitor) => {
    let { source, target, isInner } = result;
    let { info: sourceInfo, key: sourceKey } = source;
    let { info: targetInfo, key: targetKey } = target;

    let { data, rowKey } = this.state;

    let { list, treeProps } = treeToList(data, rowKey);

    //改变了层级
    if (isInner === true) {
      treeProps[sourceKey].parentKey = targetKey;
    } else {
      if (sourceInfo.depth !== targetInfo.depth) {
        treeProps[sourceKey].parentKey = targetInfo.parentKey;
      }
    }

    let newList = arrayMove(list, sourceInfo.treeIndex, targetInfo.treeIndex);

    let newTreeData = getTreeFromFlatData({
      flatData: newList,
      getKey: n => n[rowKey],
      getParentKey: n => {
        let k = n[rowKey];
        return treeProps[k].parentKey;
      },
      rootKey: ""
    });

    if (typeof this.props.onDrop === "function") {
      this.props.onDrop(result, monitor);
    }

    this.setState({ data: newTreeData.slice() });
  };

  onRow = (row, index, rowProps, rowExtra) => {
    let {
      allowDragLevel,
      useDragHandle,
      dragHandleSelector,

      canDrag,
      onDragBegin,
      onDragEnd,
      canDrop,
      onDropHover
    } = this.props;
    let dragOptions = {
      allowDragLevel,
      useDragHandle,
      dragHandleSelector,
      canDrag,
      onDragBegin,
      onDragEnd,
      canDrop,
      onDropHover,
      onDrop: this.onDrop
    };
    return {
      rowExtra: rowExtra,
      getContainer: this.getContainer,
      dragOptions
    };
  };

  render() {
    let props = this.props;

    let newProps = {
      data: this.state.data,
      onRow: this.onRow,
      components: {
        row: DraggableTableRow
      }
    };

    if (props.useDragHandle === true) {
      newProps.prependColumns = [
        {
          key: "__drag-handler",
          title: "",
          width: 30,
          align: "center",
          render: (value, row, index, extra) => {
            let el = null;
            let hasRender = false;
            if (typeof props.dragHandleRender === "function") {
              hasRender = true;
              el = props.dragHandleRender(value, row, index, extra);
            }
            return (
              <span className="drag-handler">
                {hasRender === false ? <DragIcon></DragIcon> : el}
              </span>
            );
          }
        }
      ];
    }

    return (
      <DndProvider
        backend={HTML5Backend}
        options={{ enableMouseEvents: true, enableTouchEvents: false }}
      >
        <Table {...props} {...newProps} ref={this.tableRef} />
      </DndProvider>
    );
  }
}

Draggable.defaultProps = {
  allowDragLevel: true,
  useDragHandle: false,
  dragHandleSelector: ""
};

Draggable.propTypes = {
  /** 是否允许拖动层级 */
  allowDragLevel: PropTypes.bool,
  /** 是否使用拖动按钮 */
  useDragHandle: PropTypes.bool,
  /** 拖动按钮渲染 */
  dragHandleRender: PropTypes.func,
  /** 拖动按钮元素选择器,dragHandleRender */
  dragHandleSelector: PropTypes.string,

  /** 行是否允许拖动 */
  canDrag: PropTypes.func,
  /** 拖动开始事件 */
  onDragBegin: PropTypes.func,
  /** 拖动结束事件 */
  onDragEnd: PropTypes.func,

  /** 是否允许放置 */
  canDrop: PropTypes.func,
  /** 放置hover事件 */
  onDropHover: PropTypes.func,
  /** 放置完成事件 */
  onDrop: PropTypes.func,

  /** 获取表格实例 */
  tableRef: PropTypes.func
};

export default Draggable;
