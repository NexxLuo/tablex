import React, { Component } from "react";
import { Table } from "../src/index";
import { Input, Button } from "antd";
const ButtonGroup = Button.Group;

const generateColumns = (count = 10, prefix = "column-", props) =>
  new Array(count).fill(0).map((column, columnIndex) => {
    let columnKey = `${prefix}${columnIndex}`;
    return {
      ...props,
      key: columnKey,
      dataIndex: columnKey,
      title: `Column ${columnIndex}`,
      width: 150,
      validator: (value, row) => {
        if (!value) {
          return { valid: false, message: "" };
        }

        return { valid: true, message: "" };
      },
      editor: (value, row, index, onchange, ref) => {
        return (
          <Input
            defaultValue={value}
            ref={ref}
            onChange={e => onchange({ [columnKey]: e.target.value })}
          />
        );
      }
    };
  });

const generateData = (columns, count = 20, prefix = "row-") =>
  new Array(count).fill(0).map((row, rowIndex) => {
    return columns.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.dataIndex] = `Row ${rowIndex} - Col ${columnIndex}`;

        if (rowIndex % 2 === 0) {
         // rowData.children = [{ id: "0-children-0" }];
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

let fixedColumns = columns.map((column, columnIndex) => {
  let fixed;
  if (columnIndex < 2) fixed = "left";
  if (columnIndex > 8) fixed = "right";

  return { ...column };
});

class Demo extends Component {
  state = {
    data: [],
    loading: false
  };

  componentDidMount() {}

  onEditSave(changedRows, newData, type) {
    this.setState({
      data: newData
    });
  }

  changeRowCount(count = 1) {
    count = count * 1000;
    this.setState({ loading: true });
    const data = generateData(columns, count);
    this.setState({ data, loading: false });
  }

  render() {
    return (
      <>
        <div style={{ padding: "5px 0", textAlign: "right" }}>
          <ButtonGroup>
            <Button onClick={this.changeRowCount.bind(this, 10)}>
              10K rows
            </Button>
            <Button onClick={this.changeRowCount.bind(this, 30)}>
              30K rows
            </Button>
            <Button onClick={this.changeRowCount.bind(this, 50)}>
              50K rows
            </Button>
            <Button onClick={this.changeRowCount.bind(this, 80)}>
              80K rows
            </Button>
            <Button onClick={this.changeRowCount.bind(this, 100)}>
              100K rows
            </Button>
          </ButtonGroup>
        </div>
        <div style={{ height: 460 }}>
          <Table
            editable={true}
            rowKey="id"
            expandColumnKey="column-1"
            columns={fixedColumns}
            data={this.state.data}
            orderNumber={true}
            onEditSave={this.onEditSave.bind(this)}
          />
        </div>
      </>
    );
  }
}

export default Demo;
