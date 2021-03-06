import React, { Component } from "react";
import { Table } from "tablex";

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = "Row") {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          if (column.dataIndex !== "id") {
            rowData[column.dataIndex] = Math.floor(Math.random() * 100 + 1);
          } else {
            rowData[column.dataIndex] =
              prefix + " " + rowIndex + " - Col " + columnIndex;
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
        colSpan:2
      },
      {
        dataIndex: "column-1",
        key: "column-1",
        title: "column-1",
        width: 100
      },

      {
        dataIndex: "column-2",
        key: "column-2",
        title: "column-2",
        width: 150,
        align: "center"
      },

      {
        dataIndex: "column-3",
        key: "column-3",
        title: "column-3",
        align: "right"
      },
      {
        dataIndex: "column-4",
        key: "column-4",
        title: "column-4",
        width: 100,
        align: "center"
      }
    ];

    let data = this.generateData(columns, 20);

    data[0].children = this.generateData(columns, 5, "Row-0-children-");
    data[0].children[0].children = this.generateData(
      columns,
      5,
      "Row-0-children-0-"
    );

    data[3].children = this.generateData(columns, 5, "Row-3-children-");
    data[3].children[0].children = this.generateData(
      columns,
      5,
      "Row-3-children-0-"
    );

    this.state = {
      data: data,
      columns: columns
    };
  }
  render() {
    let { columns, data } = this.state;
    return (
      <Table
        rowKey="id"
        autoHeight={true}
        columns={columns}
        data={data}
        selectMode="multiple"
        selectedRowKeys={["Row 1 - Col 0"]}
        onRow2={() => {
          return {
            onClick: () => {
              console.log("onClick");
              //this.forceUpdate();
            }
          };
        }}
        onSelect={(a, b, c) => {
          console.log("onSelect", a, b, c);
        }}
        onSelectAll={(a, b, c) => {
          console.log("onSelectAll", a, b, c);
        }}
        onUnSelect={(a, b, c) => {
          console.log("onUnSelect", a, b, c);
        }}
        onUnSelectAll={(a, b, c) => {
          console.log("onUnSelectAll", a, b, c);
        }}
        onSelectChange={(a, b, c) => {
          console.log("onSelectChange", a, b, c);
        }}
        rowSelection={{
          type: "checkbox",
          areaSelectEnabled: true,
          selectOnCheck: false, //false
          checkOnSelect: false,
          selectType: "single",
          // selectedRowKeys:["Row 1 - Col 0"],
          // selectInverted:false,
          checkStrictly: true,
          onSelect: (a, b, c) => {
            console.log("onSelect：", a, b, c);
          }
          // onCheck:(a,b,c)=>{
          //   console.log("onCheck",a,b,c)
          // }
        }}
      />
    );
  }
}

export default Demo;
