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

const columns = generateColumns(30);
const data = generateData(columns, 100);
 

class Demo extends Component {
  tableRef = React.createRef();
  tableRef2 = React.createRef();

  state = {
    data: [],
    columns:[],
    loading: false,
    expandedRowKeys: []
  };

  componentDidMount() {
    this.setState({
      data: data,
      columns:columns
    });
  }
 

  tableInner = null;
  innerRef = ins => {
    this.tableInner = ins;
  };

  scrollToItem = () => {
    if (this.tableInner) {
      this.tableInner.scrollToItem(13);
    }
  };
 
  edit = () => {
    if (this.tableRef.current) {
      this.tableRef.current.api.editRows(["2"]);
    }
  };
 
  render() {
    return (
      <div style={{height:500}}>
        <Button onClick={this.scrollToItem}>scrollToItem</Button>

        <Table
          editTools={["edit", "add", "delete"]}
          tableId="preview_table"
          sortable={false}
          loading={false}
          editable={true}
          isAppend={true}
          allowSaveEmpty={true}
          overscanCount={100}
          alwaysValidate={true}
          rowKey="id"
          onEditSave={this.onEditSave}
          ref={this.tableRef}
          columns={this.state.columns}
          checkStrictly={true}
          selectOnRowClick={false}
          selectMode="multiple"
          data={this.state.data}
        />
      </div>
    );
  }
}

export default Demo;
