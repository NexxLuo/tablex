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
    let columns = [
      {
        title: "id",
        key: "id",
        children: [
          {
            dataIndex: "id-1",
            title: "id-1",
            key: "id-1",
            onHeaderCell:function(){
                return {
                    style:{
                     minHeight:40
                    }
                }
            },
            children: [
              {
                dataIndex: "id-1-1",
                title: "id-1-1",
                key: "id-1-1",
                editor:function(){
                    return "editor"
                }
              },
              {
                dataIndex: "id-2",
                title: "id-2",
                key: "id-2",
              
              }
            ]
          }
        ]
      },
      {
        dataIndex: "column3",
        key: "column3",
        title: "column3",
        align: "right",
      },
      {
        dataIndex: "column4",
        key: "column4",
        title: "column4",
        align: "right",
      },
      {
        dataIndex: "column1",
        key: "column1",
        title: "column1",

        children: [
          {
            dataIndex: "column1-1",
            title: "column1-1",
            key: "column1-1",
            children: [
              {
                dataIndex: "column1-1-1",
                title: "column1-1-1",
                key: "column1-1-1",
              }
            ]
          },
          {
            dataIndex: "column1-2",
            title: "column1-2",
            key: "column1-2",
            children: [
              {
                dataIndex: "column1-2-1",
                title: "column1-2-1",
                key: "column1-2-1",
              }
            ]
          }
        ]
      },

      
    ];

    columns=[
      {
        dataIndex: 'id',
        title: 'id',
        key: 'id',
        width: 150,
        align: 'center',

      },
      {
        key: 'column-1',
        title: 'column-1',

        children: [
          {
            dataIndex: 'column-1-1',
            key: 'column-1-1',
            title: 'column-1-1',
            width: 100,
          },
          {
            dataIndex: 'column-1-2',
            key: 'column-1-2',
            title: 'column-1-2',
            children: [
              {
                dataIndex: 'column-1-2-1',
                key: 'column-1-2-1',
                title: 'column-1-2-1',
              },
              {
                dataIndex: 'column-1-2-2',
                key: 'column-1-2-2',
                title: 'column-1-2-2',
         
              },
            ],
          },
        ],
      },

      {
        dataIndex: 'column-2',
        key: 'column-2',
        title: 'column-2',
        width: 100,
        align: 'center',
      },
      {
        dataIndex: 'column-3',
        key: 'column-3',
        title: 'column-3',
        align: 'center',
      },
    ]

    let columns2=[
      {
        dataIndex: "column1",
        key: "column1",
        title: "column1",
        align: "right",
      },
      {
        dataIndex: "column2",
        key: "column2",
        title: "column2",
        align: "right",
      },
      {
        dataIndex: "column3",
        key: "column3",
        title: "column3",
        align: "right",
      },
      {
        dataIndex: "column4",
        key: "column4",
        title: "column4",
        align: "right",
      },
      {
        dataIndex: "column5",
        key: "column5",
        title: "column5",
        align: "right",
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


  onBeforeAdd=()=>{
console.log("asd")
    this.setState({})
    return true;
  }

  render() {
    let { columns, data } = this.state;
    console.log("columns:",columns)

    return (
      <Table
      bordered={true}
      editable={true}
      autoHeight={true}
      ref="table"
      rowKey="id"
      columns={columns}
      dataSource={data}
      editTools={["edit", "add", "delete",]}
      selectMode="multiple"
      defaultAddCount={1}
      isAppend={false}
      validateTrigger="onChange"
      onBeforeAdd={this.onBeforeAdd}
      onBeforeEdit={this.onBeforeAdd}
      onEditSave={this.onEditSave}
      editAll={true}
      onCancel={this.onCancel}
      />
    );
  }
}

export default Demo;
