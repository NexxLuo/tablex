import React, { Component } from "react";
import { Table } from "tablex";
import { Input } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import "./styles.css";

const generateData = (columns, count = 20, prefix = "row-") =>
  new Array(count).fill(0).map((row, rowIndex) => {
    return columns.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.dataIndex] = `Row ${rowIndex} - Col ${columnIndex}`;
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

  onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    
    this.setState(({ data }) => ({
      data: arrayMove(data, result.source.index, result.destination.index)
    }));
  }

  render() {
    const { data, columns } = this.state;

    return (
      <div style={{ height: 600 }}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="table-body">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Table
                  rowKey="id"
                  expandColumnKey="column-1"
                  editable={true}
                  columns={columns}
                  selectMode="none"
                  data={data}
                  orderNumber={true}
                  validateTrigger="onChange"
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
}

export default Demo;
