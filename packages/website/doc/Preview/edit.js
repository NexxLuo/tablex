import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox, Input, Button, Table as AntdTable } from "antd";
import Search from "antd/lib/input/Search";

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
  for (let i = 0; i < 50; i++) {
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

    this.state = {
      data: data,
      columns: columns,
      current: 1,
      pageSize: 10,
      total: data.length,
      selectedRowKeys: []
    };
  }

  contextMenu = row => {
    console.log("contextMenu:", row && row.id);

    if (row && row.id === "Row 4 - Col 0") {
      return <div>asadasd</div>;
    }
    return null;
  };

  addData = () => {
    let arr = new Array(5).fill(0).map((d, i) => {
      return {
        id: "addedData-" + i + "-" + new Date().getTime(),
        "column-1": i === 0 ? "" : "value-" + i,
        "column-2": i === 0 ? "" : "value2-" + i,
        "column-3":  "value3-" + i
      };
    });

    console.log("arr:", arr);
    this.refs.tb.api.addRows(arr, true, false);
  };

  onEditSave = (changedRows, newRows, type) => {
    this.setState({ data: newRows });
    console.log("onEditSave");
  };

  render() {
    let { columns, data } = this.state;

    return (
      <>
        <div style={{ height: 400 }}>
          <Table
            rowKey="id"
            ref="tb"
            editable={true}
            columns={columns}
            selectMode="multiple"
            data={data}
            onEditSave={this.onEditSave}
            ignoreEmptyRow={true}
            isAppend={true}
            validateTrigger="onChange"
            allowSaveEmpty={false}
            alwaysValidate={false}
            editTools={[
              "edit",
              "add",
              "delete",
              () => {
                return <Button onClick={this.addData}>新增数据</Button>;
              }
            ]}
          />
        </div>
      </>
    );
  }
}

export default Demo;
