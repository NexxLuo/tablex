import React, { Component } from "react";
import { Table } from "tablex";
import { Button, Popover } from "antd";

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = "Row") {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          if (column.dataIndex !== "id") {
            rowData[column.dataIndex] = Math.floor(Math.random() * 100 + 1);
          } else {
            rowData[column.dataIndex] = "id-" + rowIndex;
          }
          return rowData;
        },
        {
          id: prefix + rowIndex,
          parentId: null
        }
      );
    });
  }
  constructor(props) {
    super(props);
    const columns = [
      {
        dataIndex: "id",
        title: "id",
        key: "id",
        width: 150,
        align: "center"
      },
      {
        dataIndex: "column-1",
        title: "column-1",
        width: 100
      },

      {
        dataIndex: "column-2",
        title: "column-2",
        width: 150,
        align: "center"
      },

      {
        dataIndex: "column-3",
        title: "column-3",
        align: "right"
      },
      {
        dataIndex: "column-4",
        title: "column-4",
        width: 100,
        align: "center"
      }
    ];

    let data = this.generateData(columns, 10);

    this.state = {
      data: data,
      columns: columns
    };
  }
  expandedRowRender(record, i, extra) {
    if (extra.frozen === "none") {
        let strArr=new Array(10+i*10).fill("expandedRowRender").join("");
    return <div>{strArr}</div>;
    }
    return null;
  }
  onExpandedRowsChange(arr) {
    this.setState({ expandedRowKeys: arr });
  }
  expandAll = () => {
    let ins = this.refs["table"];
    console.log("expandAll:", ins.api.expandAll);
    if (ins) {
      ins.api.expandAll();
    }
  };
  render() {
    let { columns, data } = this.state;
    return (
      <div style={{ height: 400 }}>
        <Button onClick={this.expandAll}>expand all</Button>
        <Table
          rowKey="id"
          ref="table"
          autoRowHeight={true}
          columns={columns}
          expandRowHeight={100}
          expandedRowRender={this.expandedRowRender.bind(this)}
          onExpandedRowsChange={this.onExpandedRowsChange.bind(this)}
          data={data}
        />
      </div>
    );
  }
}

export default Demo;
