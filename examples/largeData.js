import React, { Component } from "react";
import { Table } from "../src/index";

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
          rowData.children = [{ id: "0-children-0" }];
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
const data = generateData(columns, 10000);

let fixedColumns = columns.map((column, columnIndex) => {
  let fixed;
  if (columnIndex < 2) fixed = "left";
  if (columnIndex > 8) fixed = "right";

  return { ...column, resizable: true, fixed };
});

class Demo extends Component {
  state = {
    data: []
  };

  componentDidMount() {
    this.setState({
      data: data
    });
  }

  render() {
    return (
      <Table
        rowKey="id"
        expandColumnKey="column-1"
        columns={fixedColumns}
        data={this.state.data}
        orderNumber={true}
        disabledSelectKeys={[]}
        onSelectChange={(keys, rows) => {
          console.log("onSelectChange:", rows);
        }}
      />
    );
  }
}

export default Demo;
