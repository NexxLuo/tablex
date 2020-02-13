import React from "react";
import PropTypes from "prop-types";
import Table from "../Editable";
import DraggableRow from "./DraggableRow";
import ReactDom from "react-dom";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import DragIcon from "./DragIcon";
import { treeToList, getTreeFromFlatData } from "../utils";

import "./styles.css";

const arrayMove = (array, from, to) => {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
};

function DraggableTableRow(props) {
  let { rowProps, onRowProps = {}, dragOptions } = props;
  return (
    <DraggableRow
      rowProps={rowProps}
      onRowProps={onRowProps}
      dragOptions={dragOptions}
    />
  );
}

class Draggable extends React.Component {
  tableRef = React.createRef(null);

  acceptType = "";

  constructor(props) {
    super(props);
    this.state = { data: [], rowKey: "" };
    this.acceptType = "Draggable_" + new Date().getTime();
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

  onDragComplete = result => {
    let { source, target, isInner } = result;
    let { info: sourceInfo, key: sourceKey, data: sourceData } = source;
    let { info: targetInfo, key: targetKey, data: targetData } = target;

    let { data, rowKey } = this.state;

    let { list, treeProps } = treeToList(data, rowKey);

    let oldIndex = sourceInfo.treeIndex;
    let newIndex = targetInfo.treeIndex;

    if (newIndex < oldIndex) {
      newIndex = newIndex + 1;
    }

    //层级改变
    if (sourceInfo.parentKey !== targetInfo.parentKey) {
      if (isInner === true) {
        treeProps[sourceKey].parentKey = targetKey;
      } else {
        treeProps[sourceKey].parentKey = targetInfo.parentKey;
      }
    } else {
      if (isInner === true) {
        treeProps[sourceKey].parentKey = targetKey;
      }
    }

    let newList = arrayMove(list, oldIndex, newIndex);

    let newTreeData = getTreeFromFlatData({
      flatData: newList,
      getKey: n => n[rowKey],
      getParentKey: n => {
        let k = n[rowKey];
        return treeProps[k].parentKey;
      },
      rootKey: ""
    });

    this.setState({ data: newTreeData });

    if (typeof this.props.onDragComplete === "function") {
      this.props.onDragComplete({
        data: newTreeData,
        flatData: newList,
        target: targetData,
        source: sourceData
      });
    }
  };

  onDrop = (result, monitor) => {
    if (typeof this.props.onDrop === "function") {
      this.props.onDrop(result, monitor);
    }

    this.onDragComplete(result);
  };

  onRowComponent = (row, index, rowProps, rowExtra) => {
    let {
      allowDragLevel,
      useDragHandle,
      dragHandleSelector,
      canDrag,
      onDragBegin,
      onDragEnd,
      canDrop,
      onDropHover,
      rowKey
    } = this.props;

    let dragOptions = {
      itemInfo: rowExtra,
      itemKey: row[rowKey],
      index: index,
      data: row,
      getContainer: this.getContainer,
      acceptType: this.acceptType,

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
      dragOptions
    };
  };

  render() {
    let props = this.props;

    let newProps = {
      data: this.state.data,
      onRowComponent: this.onRowComponent,
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

    return <Table {...props} {...newProps} ref={this.tableRef} />;
  }
}

const withDragDropContext = Cmp => {
  return class DraggableTable extends React.Component {
    render() {
      return (
        <DndProvider backend={HTML5Backend} context={window}>
          <Cmp {...this.props} />
        </DndProvider>
      );
    }
  };
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

export default withDragDropContext(Draggable);
