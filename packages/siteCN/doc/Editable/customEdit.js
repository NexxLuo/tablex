import React, { Component } from "react";
import { Table } from "tablex";
import { Input, Button } from "antd";
class Demo extends React.Component {
  constructor(props) {
    super(props);

    this.tableRef = React.createRef();

    this.state = {
      data: [],
      loading: false,
      expandedRowKeys: []
    };

    this.columns = [
      {
        dataIndex: "column-1",
        key: "column-1",
        title: "column-1",
        align: "left",
        halign: "center",
        minWidth: 300,
        onCell: (row, value, index) => {
          return {
            onClick: () => {
              this.beginEdit(row);
            }
          };
        },
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
        title: "appellation",
        width: 150,
        halign: "left",
        children: [
          {
            dataIndex: "address",
            title: "name",
            width: 200,
            onCell: (row, value, index) => {
              return {
                onClick: () => {
                  this.beginEdit(row);
                }
              };
            },
            editor: function(value, row, index, onchange, ref) {
              return (
                <Input
                  defaultValue={value}
                  ref={ref}
                  onChange={e => onchange({ address: e.target.value })}
                />
              );
            }
          },
          {
            title: "nick name",
            width: 150,
            children: [
              {
                dataIndex: "id",
                title: "nick-1",
                maxWidth: 300,
                width: 150
              },
              {
                dataIndex: "level",
                title: "level"
              }
            ]
          }
        ]
      },
      {
        dataIndex: "id",
        key: "column-4",
        title: "id"
      }
    ];
  }

  componentDidMount() {
    function createData(level, parentKey, maxLevel, index) {
      if (level > maxLevel) {
        return;
      }

      let l = level;
      let data = [];
      for (let i = 0; i < 3; i++) {
        let k = parentKey + "-" + level + "-" + i;
        let d = {
          id: k,
          "column-1": "Edward King " + k,
          age: 32,
          level: level,
          address: "London, Park Lane no. " + i
        };

        if (i === 2) {
          d.children = createData(l + 1, k, maxLevel, i);
        }

        data.push(d);
      }
      return data;
    }

    function createTreeData() {
      let data = [];
      for (let i = 0; i < 10; i++) {
        let childrens = createData(0, i, 2);
        let d = {
          id: "" + i,
          level: 0,
          "column-1": "Edward King " + i,
          age: i,
          address: "London, Park Lane no. " + i
        };

        if (i % 3 === 0) {
          d.children = childrens;
        }

        data.push(d);
      }

      return data;
    }

    this.setState({
      data: createTreeData()
    });
  }

  beginEdit(row) {
    let arr = [];
    arr.push(row.id);
    this.tableRef.current.api.editRows(arr);
  }

  completeEdit() {
    this.tableRef.current.api.completeEdit();
  }

  cancelEdit() {
    this.tableRef.current.api.cancelEdit();
  }

  insertData() {
    let arr = [];
    arr.push({ id: "inserted-row-" + new Date().getTime() });

    this.tableRef.current.api.insertData({
      data: arr,
      parentKey: "3",
      editing: true,
      prepend: false,
      startIndex: 2
    });
  }

  modifyData() {
    let arr = [];
    arr.push({ id: "inserted-row-" + new Date().getTime() });

    this.tableRef.current.api.modifyData([
      {
        id: "3",
        "column-1": "modifyData-" + new Date().getTime(),
        level: 3
      }
    ]);
  }

  delete() {
    this.tableRef.current.api.deleteData();
  }

  onEditSave(changedRows, newRows, editType) {
    console.log("onEditSave changedRows:", changedRows);
    console.log("onEditSave newRows:", newRows);
    this.setState({ data: newRows });
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <Table
          header={() => {
            return (
              <div>
                <Button
                  onClick={this.completeEdit.bind(this)}
                  style={{ cursor: "pointer" }}
                >
                  complete edit
                </Button>

                <Button
                  onClick={this.cancelEdit.bind(this)}
                  style={{ cursor: "pointer", marginLeft: 10 }}
                >
                  cancel edit
                </Button>

                <Button
                  onClick={this.insertData.bind(this)}
                  style={{ cursor: "pointer", marginLeft: 10 }}
                >
                  insert data
                </Button>

                <Button
                  onClick={this.modifyData.bind(this)}
                  style={{ cursor: "pointer", marginLeft: 10 }}
                >
                  modify data
                </Button>

                <Button
                  onClick={this.delete.bind(this)}
                  style={{ cursor: "pointer", marginLeft: 10 }}
                >
                  delete
                </Button>
              </div>
            );
          }}
          editable={false}
          isAppend={false}
          allowSaveEmpty={true}
          alwaysValidate={true}
          ref={this.tableRef}
          rowKey="id"
          onEditSave={this.onEditSave.bind(this)}
          columns={this.columns}
          selectMode="multiple"
          checkStrictly={false}
          data={this.state.data}
          validateTrigger="onChange"
          selectOnRowClick={false}
        />
      </div>
    );
  }
}
export default Demo;
