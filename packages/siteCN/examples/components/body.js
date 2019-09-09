import React, { Component } from "react";
import { Table } from "tablex";
import "./styles.css";

import { SortableContainer, SortableElement } from "react-sortable-hoc";

const DraggableRow = SortableElement(props => {
  return <div {...props} />;
});

const DraggableBody = SortableContainer(({ className, children }) => {
  return <div className={className}>{children}</div>;
});

function DraggableTableRow(props) {
  let { rowData, rowIndex, rowProps } = props;
  return <DraggableRow {...rowProps} index={rowIndex} data-key={rowData.id} />;
}

function DraggableTableBody(props) {
  return <DraggableBody {...props} />;
}

const DraggableTable = props => {
  return (
    <Table
      {...props}
      components={{
        body: ({ className, children }) => {
          return (
            <DraggableTableBody className={className} {...props}>
              {children}
            </DraggableTableBody>
          );
        },
        row: DraggableTableRow
      }}
    />
  );
};

const generateColumns = (count = 10, prefix = "column-", props) =>
  new Array(count).fill(0).map((column, columnIndex) => ({
    ...props,
    key: `${prefix}${columnIndex}`,
    dataIndex: `${prefix}${columnIndex}`,
    title: `Column ${columnIndex}`,
    width: 150
  }));

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

const columns = generateColumns(10);
const data = generateData(columns, 100);

const arrayMove = (array, from, to) => {
  //array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
};

class Demo extends Component {
  constructor(props) {
    super(props);
    this.scrollRef = null;
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    this.setState({
      data: data
    });
  }

  tableScrollRef(ins) {
    this.scrollRef = ins;
    if (ins) {
      ins.id = "tableScroll";
    }
  }

  onSortEnd({ newIndex, oldIndex }) {
    this.setState(({ data }) => ({
      data: arrayMove(data, oldIndex, newIndex)
    }));
  }

  render() {
    return (
      <DraggableTable
        scrollRef={this.tableScrollRef.bind(this)}
        rowKey="id"
        expandColumnKey="column-1"
        columns={columns}
        selectMode="none"
        data={this.state.data}
        orderNumber={true}
        lockAxis="y"
        onSortEnd={this.onSortEnd.bind(this)}
        distance={10}
        helperClass="tablex-row-dragging"
        getContainer={function() {
          return document.getElementById("tableScroll");
        }}
      />
    );
  }
}

export default Demo;
