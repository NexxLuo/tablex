import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox, Input, Button } from "antd";

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

function createTreeData(len=50) {
  let data = [];
  for (let i = 0; i < len; i++) {
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

class Demo extends Component {
  tableRef = React.createRef();

  state = {
    data: [],
    loading: false
  };

  componentDidMount() {

    columns[0].fixed="left";
    columns.forEach(d=>{

        d.editor=()=>{

            return <Input></Input>
        }

    })

    this.setState({
      columns: columns,
      data: createTreeData(100)
    },()=>{

        let ins=this.tableRef.current;
        if (ins) {
            ins.api.expandAll();
        }

    });
  }

  render() {
    let { columns, data } = this.state;
    return (
      <>
        <Button onClick={this.scrollToItem1}>scrollToItem</Button>

        <div style={{ height: "800px", marginTop: 10 }}>
          <Table
            loading={this.state.loading}
            editTools={["edit", "add", "delete"]}
            sortable={false}
            editable={true}
            isAppend={true}
            allowSaveEmpty={true}
            virtual={true}
            overscanCount={2}
            alwaysValidate={true}
            rowKey="id"
            onEditSave={this.onEditSave}
            ref={this.tableRef}
            columns={columns}
            checkStrictly={true}
            selectMode="multiple"
            data={data}
            onSelectChange={this.onSelectChange}
          />
        </div>
      </>
    );
  }
}

export default Demo;
