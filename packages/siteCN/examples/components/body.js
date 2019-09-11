import React, { Component } from "react";
import ReactDom from "react-dom";
import { Table } from "tablex";
import { Input, Button } from "antd";

import "./styles.css";

import { SortableContainer, SortableElement } from "react-sortable-hoc";

const DraggableRow = SortableElement(props => {
  return <div {...props} />;
});

const DraggableContainer = SortableContainer(({ className, children }) => {
  return <div className={className}>{children}</div>;
});

function DraggableTableRow(props) {
  let { rowData, rowIndex, rowProps } = props;
  return <DraggableRow {...rowProps} index={rowIndex} data-key={rowData.id} />;
}

const DraggableTable = props => {
  return (
    <Table
      {...props}
      components={{
        body: ({ className, children }) => {
          return (
            <DraggableContainer className={className} {...props}>
              {children}
            </DraggableContainer>
          );
        },
        row: DraggableTableRow
      }}
    />
  );
};

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

  getContainer() {
    let el = ReactDom.findDOMNode(this);
    return el.querySelector(".tablex-table-body>div");
  }

  render() {
    return (
      <DraggableTable
        rowKey="id"
        expandColumnKey="column-1"
        editable={true}
        columns={this.state.columns}
        selectMode="none"
        data={this.state.data}
        orderNumber={true}
        lockAxis="y"
        onSortEnd={this.onSortEnd.bind(this)}
        validateTrigger="onChange"
        distance={10}
        helperClass="tablex-row-dragging"
        getContainer={this.getContainer.bind(this)}
      />
    );
  }
}

export default Demo;
