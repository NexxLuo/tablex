import React, { Component } from "react";
import { Table } from "tablex";
import { Input, Button } from "antd";

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = "Row") {
    return new Array(count).fill(0).map(function(row, rowIndex) {
      return columns.reduce(
        function(rowData, column, columnIndex) {
          if (column.dataIndex !== "id") {
            rowData[column.dataIndex] = Math.floor(Math.random() * 100 + 1);
          } else {
            rowData[column.dataIndex] =
              prefix + "-" + rowIndex + "-col-" + columnIndex;
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
        key: "column-1",
        title: "column-1",
        validator: value => {
          if (!value) {
            return {
              valid: false
            };
          } else {
            return {
              valid: true
            };
          }
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ "column-1": e.target.value })}
            ></Input>
          );
        }
      },

      {
        dataIndex: "column-2",
        key: "column-2",
        title: "column-2",
        width: 150,
        align: "center",
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ "column-2": e.target.value })}
            ></Input>
          );
        }
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

    let data = this.generateData(columns, 10);

    data[1].children = this.generateData(columns, 1, "children");

    console.log("data:", data[1].children);

    this.state = {
      data: data,
      columns: columns,
      current: 1,
      pageSize: 10,
      total: data.length,
      selectedRowKeys: []
    };
  }

  addData() {
    let arr = new Array(5).fill(0).map((d, i) => {
      return {
        id: "addedData-" + i + "-" + new Date().getTime(),
        "column-1": i === 0 ? "" : "value-" + i,
        "column-2": i === 0 ? "" : "value2-" + i,
        "column-3": "value3-" + i
      };
    });

    this.refs.tb.api.addRows(arr);
  }

  insertData() {
    let arr = new Array(5).fill(0).map((d, i) => {
      return {
        id: "addedData-" + i + "-" + new Date().getTime(),
        "column-1": i === 0 ? "" : "value-" + i,
        "column-2": i === 0 ? "" : "value2-" + i,
        "column-3": "value3-" + i
      };
    });

    this.refs.tb.api.insertData({ data: arr, editing: true });

    let r1 = this.refs.tb.api.getAllData();
    let r2 = this.refs.tb.api.getDataState();

    this.refs.tb.api.editAll();

    this.setState({ isEdit: true, data: this.state.data.slice() });

    console.log("getData 1:", r1);
    console.log("getData 2:", r2);
  }

  deleteData() {
    let keys = ["children-0-col-0"]; //Row-1-col-0
    this.refs.tb.api.deleteData(keys);
  }

  expandData() {
    this.refs.tb.api.expandAll();
  }

  onEditSave(changedRows, newRows, type) {
    this.setState({ data: newRows });
    console.log("onEditSave:", changedRows);
  }

  completeEdit() {
    this.refs.tb.api.completeEdit();
  }
  onComplete(a) {
    console.log("onComplete:", a);
  }

  getData() {
    let r1 = this.refs.tb.api.getAllData();
    let r2 = this.refs.tb.api.getDataState();

    console.log("getData 1:", r1);
    console.log("getData 2:", r2);
  }

  filterData() {
    let r1 = this.refs.tb.api.filterData((d, i) => {
      return d["column-2"] % 2 === 0;

      console.log("d:", d);
    });

    //  this.setState({data:this.state.data.slice()})
  }

  render() {
    let { columns, data } = this.state;

    return (
      <>
        <div style={{ height: 400 }}>
          <Table
            rowKey="id"
            ref="tb"
            columnOptions={{
              "column-1": { visible: true },
              "column-2": { required: true }
            }}
            editable={true}
            edittingToolsShowType={3}
            columns={columns}
            selectMode="multiple"
            loading={false}
            onAdd={() => {
              this.forceUpdate();
            }}
            data={data}
            onEditSave={this.onEditSave.bind(this)}
            onComplete={this.onComplete.bind(this)}
            ignoreEmptyRow={false}
            isAppend={true}
            validateTrigger="onChange"
            allowSaveEmpty={false}
            addAsChanged={true}
            alwaysValidate={false}
            alwaysSave={false}
            defaultGroupedColumnKey2={["id"]}
            groupedColumnSummary2={{
              style: { float: "right" },
              data: [
                {
                  title: "列1",
                  dataIndex: "column-1",
                  type: "min"
                },
                {
                  title: "列2",
                  dataIndex: "column-2",
                  type: "max"
                },
                {
                  title: "列3",
                  dataIndex: "column-3",
                  type: "sum"
                },
                {
                  title: "列4",
                  dataIndex: "column-4",
                  type: "avg"
                }
              ],
              render: (text, value, d) => {
                return text;
              }
            }}
            editTools={[
              "edit",
              "add",
              "delete",
              function() {
                return (
                  <Button onClick={this.addData.bind(this)}>新增数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.insertData.bind(this)}>插入数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.completeEdit.bind(this)}>
                    完成编辑
                  </Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.deleteData.bind(this)}>删除数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.getData.bind(this)}>获取数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.filterData.bind(this)}>过滤数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.expandData.bind(this)}>展开所有</Button>
                );
              }.bind(this)
            ]}
          />
        </div>
      </>
    );
  }
}

export default Demo;
