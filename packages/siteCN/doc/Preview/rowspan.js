import React from "react";
import Table, { flatten } from "tablex";
import { Input, Checkbox, Menu, Button } from "antd";

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = "Row") {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          rowData[column.dataIndex] =
            prefix + " " + rowIndex + " - Col " + columnIndex;
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
        key: "id",
        title: "id",
        width: 100
      },
      {
        dataIndex: "column-2",
        title: "column-2",
        key: "column-2",
        maxWidth: 300,
        width: 150,
        align: "center",
        render: (value, row, index) => {
      

          let rowNum=12*3;
          const obj = {
            children: value,
            props: {}
          };
          //alert(+rowNum)

          console.info("跨几行？" + rowNum);
          if (index % rowNum == 0) {
            obj.props.rowSpan = rowNum;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;

        }
      },
      {
        dataIndex: "column-3",
        key: "column-3",
        title: "column-3",
        width: 150,
        align: "center",
        render2: (value, row, index) => {
          const obj = {
            children: value,
            props: {}
          };
          if (index === 6) {
            obj.props.rowSpan = 8;
            obj.children = (
              <div
                style={{
                  width: 12,
                  wordBreak: "break-all",
                  whiteSpace: "pre-line",
                  margin: "auto"
                }}
              >
                行数据合并{index}
              </div>
            );
          }

          return obj;
        }
      },

      {
        dataIndex: "column-4",
        key: "column-4",
        title: "column-4",
        align: "right"
      }
    ];

    let data = this.generateData(columns, 2000);

    this.state = {
      data: data,
      columns: columns
    };
  }

  render() {
    let { columns, data } = this.state;

    return (
      <div style={{ height: 700 }}>
        <Table
          rowKey="id"
          columns={columns}
          overscanCount={32}
          virtual={true}
          data={data}
          selectMode="multiple"
          orderNumber={true}
        />
      </div>
    );
  }
}

export default Demo;
