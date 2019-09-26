import React, { memo, useMemo, useRef, Component, useState } from "react";

import ReactDom from "react-dom";
import { Table } from "tablex";
import { Input, Button } from "antd";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import "./styles.css";

const ItemTypes = {
  CARD: "card"
};

const DraggableRow = memo(
  ({ id, moveCard, className, style, index, children, data, getContainer }) => {
    let [{ isUnder }, setState] = useState({ isUnder: false });
    const ref = useRef(null);
    const [{ isDragging, offset, height }, connectDrag] = useDrag({
      item: { id, type: ItemTypes.CARD },
      collect: monitor => {
        const result = {
          isDragging: monitor.isDragging(),
          offset: monitor.getInitialSourceClientOffset(),
          height: style.height
        };
        return result;
      },
      end(item, monitor) {
        console.log("end:", data);
      }
    });
    const [{ isActive }, connectDrop] = useDrop({
      accept: ItemTypes.CARD,
      collect: monitor => {
        //  console.log("moitor:", monitor.getSourceClientOffset());
        const result = {
          isActive: monitor.canDrop() && monitor.isOver()
        };

        return result;
      },
      drop(item, monitor) {
        console.log("drop:", data);
      },
      hover(item, monitor) {
        let { id: draggedId } = item;
        // console.log("hover:",monitor.getInitialClientOffset()) //开始拖动的初始位置
        // console.log("hover:",monitor.getSourceClientOffset()) //当前drageSource元素拖到的位置
        // console.log("hover:",monitor.getDifferenceFromInitialOffset()) //当前相对于初始拖动的差值
        //console.log("hover:",monitor.getInitialSourceClientOffset()) //dragSource初始位置
        // console.log("hover:",monitor.getClientOffset()) //上一次的拖动位置

        if (draggedId !== id) {
          let y = monitor.getClientOffset().y;

          let el = ref.current;

          if (el) {
            const hover_y = el.getBoundingClientRect().y;

            let o = y > hover_y + height / 2;

            let container = getContainer();
            if (container) {
              let arr = container.querySelectorAll(".dragg-under") || [];
              arr.forEach(e => {
                e.classList.remove("dragg-under");
              });
            }

            if (o) {
              el.classList.add("dragg-under");
            }

            //  console.log("hover:", y, hover_y, o, height);
          }
        }
      }
    });
    connectDrag(ref);
    connectDrop(ref);

    let cls = [className];
    if (isActive) {
      cls.push("dragg-hover");
    }

    return (
      <div ref={ref} className={cls.join(" ")} style={{ ...style }}>
        {children}
      </div>
    );
  }
);

const DraggableRow2 = ({ id, className, style, index, children, data }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "card",
    hover(item, monitor) {
      console.log("hover:", item.data, data);
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      // moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: "card", id: data.id, data: data, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div ref={ref} className={className} style={{ ...style }}>
      {children}
    </div>
  );
};

function DraggableTableRow(props) {
  let { rowData, rowIndex, rowProps, getContainer } = props;
  return (
    <DraggableRow
      {...rowProps}
      getContainer={getContainer}
      data={rowData}
      index={rowIndex}
      data-key={rowData.id}
      id={rowData.id}
    />
  );
}

const generateData = (columns, count = 20, prefix = "row-") =>
  new Array(count).fill(0).map((row, rowIndex) => {
    return columns.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.dataIndex] = `Row ${rowIndex} - Col ${columnIndex}`;

        if (rowIndex === 0) {
          //rowData.children = [];
        }

        return rowData;
      },
      {
        id: `${prefix}${rowIndex}`,
        parentId: null
      }
    );
  });

const arrayMove = (array, from, to) => {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
};

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    let columns = [
      {
        dataIndex: "column-1",
        key: "column-1",
        title: "column-1",
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: "请输入" };
          }

          return { valid: true, message: "false" };
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e =>
                onchange([
                  { "column-1": e.target.value, id: row.id },
                  { id: "3", address: e.target.value }
                ])
              }
            />
          );
        }
      },
      {
        width: 150,
        dataIndex: "column-2",
        title: "column-2"
      },
      {
        width: 150,
        dataIndex: "column-3",
        title: "column-3"
      },
      {
        width: 150,
        dataIndex: "column-4",
        title: "column-4"
      }
    ];

    const data = generateData(columns, 100);

    this.setState({
      data: data,
      columns: columns
    });
  }

  onSortEnd({ newIndex, oldIndex }) {
    this.setState(({ data }) => ({
      data: arrayMove(data, oldIndex, newIndex)
    }));
  }

  getContainer = () => {
    let el = ReactDom.findDOMNode(this);
    return el.querySelector(".tablex-table-body>div");
  };

  onRow() {
    return {
      getContainer: this.getContainer
    };
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <Table
          rowKey="id"
          expandColumnKey="column-1"
          editable={true}
          columns={this.state.columns}
          selectMode="none"
          data={this.state.data}
          orderNumber={true}
          onRow={this.onRow.bind(this)}
          components={{
            row: DraggableTableRow
          }}
        />
      </DndProvider>
    );
  }
}

export default Demo;
