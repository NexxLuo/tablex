import React, { Component } from "react";
import { Table  } from "tablex";

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

 

class Demo extends Component {
  state = {
    data: [],
    current: 1,
    pageSize: 10,
    total: data.length
  };

  componentDidMount() {
    this.setState({
      data: data
    });
  }

  onPageChange = (pageIndex, pageSize) => {
    this.setState({
      current: pageIndex,
      pageSize,
    });
  };

  onRefresh = (pageIndex, pageSize) => {
    this.setState({
      current: pageIndex,
      pageSize
    });
  };

  render() {
    let { current, pageSize, total } = this.state;
    return (
      <Table
        rowKey="id"
        columns={columns}
        editToolsConfig={{
          position: "bottom"
        }}
        data={this.state.data}
        tableId="table"
        alwaysValidate={true}
        validateTrigger="onChange"
        dataControled={true}
        orderNumber={true}
        isAppend={true}
        pagination={{
          current,
          pageSize,
          total,
          onPageChange: this.onPageChange,
          onRefresh: this.onRefresh
        }}
      />
    );
  }
}

export default Demo;
