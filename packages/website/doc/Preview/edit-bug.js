import React, { PureComponent } from "react";
import { Table } from "tablex";
import { Input, Button } from "antd";

class Demo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      current: 1,
      pageSize: 10,
      total: 0,
      selectedRowKeys: []
    };
    this.columns = [
      {
        dataIndex: "bug",
        title: "bug",
        key: "bug",
        width: 150,
        align: "center",
        editor: (text, row, index, onchange, ref) => {
          return (
            <Button onClick={() => this.insertData()}>点击此处复现bug</Button>
          );
        }
      },
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
  }

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

  insertEmptData() {
    this.refs.tb.api.insertData({
      data: [
        {
          id: "emptyId-" + new Date().getTime(),
          isEmptyData: true
        }
      ]
    });
    this.refs.tb.api.editAll();
  }

  insertData() {
    let source = JSON.parse(JSON.stringify(this.state.data));
    let arr = new Array(1).fill(0).map((d, i) => {
      return {
        id: "addedData-" + i + "-1",
        "column-1": "value-" + i + "测测测测1" + new Date().getTime(),
        "column-2": "value2-" + i + "测测测测2" + new Date().getTime(),
        "column-3": "value3-" + i
      };
    });
  
    let tableData = this.refs.tb.api.getDataState().data;
    let emptyRowKeys = tableData.filter(i => !i.Code).map(i => i.id);
    this.refs.tb.api.deleteData(emptyRowKeys, () => {
      this.refs.tb.api.insertData({ data: arr, editing: true });
      var obj = {};
      // var newdata =
      //   source &&
      //   source.concat(arr).reduce(function(a, b) {
      //     obj[b.id] ? "" : (obj[b.id] = true && a.push(b));
      //     return a;
      //   }, []);
      // this.setState({
      //   data: newdata
      // });
    });
    // let deleteKeys = [];
    // this.refs.tb.api.getDataState().inserted.forEach(d => {
    //   if (d.isEmptyData) {
    //     deleteKeys.push(d.id);
    //   }
    // });
    // this.refs.tb.api.deleteData(deleteKeys, () => {
    //   this.refs.tb.api.insertData({ data: arr });
    // });
    // this.refs.tb.api.editAll();
  }

  deleteDatas = e => {
    const dataList = this.refs.tb.api.getSelections().data;
    const removeID = [];
    dataList &&
      dataList.forEach(it => {
        removeID.push(it["id"]);
      });
    console.log("removeID", removeID);
    this.refs.tb.api.deleteData(removeID);
  };

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
    let r2 = this.refs.tb.api.getDataState();
    console.log("getData:", r2);
  }

  /**
   * @param {*} type
   * @param {*} cout 新增行数/默认为1
   */
  add = (type, cout) => {
    let insertData = [];
    for (let i = 0; i < cout; i++) {
      let dataOne = {};
      dataOne["id"] = "inserted_" + new Date().getTime();
      insertData.push(dataOne);
    }
    this.refs.tb.api.insertData({
      data: insertData
    });
    this.refs.tb.api.editAll();
  };

  render() {
    let { data } = this.state;
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
            columns={this.columns}
            selectMode="multiple"
            loading={false}
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
            editTools={[
              function() {
                return (
                  <Button onClick={this.insertEmptData.bind(this)}>
                    插入空数据
                  </Button>
                );
              }.bind(this),
              () => <Button onClick={() => this.add(0, 1)}>插入数据</Button>, //插入1行数据
              function() {
                return (
                  <Button onClick={e => this.deleteDatas(e)}>删除数据</Button>
                );
              }.bind(this),
              function() {
                return (
                  <Button onClick={this.getData.bind(this)}>获取数据</Button>
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
