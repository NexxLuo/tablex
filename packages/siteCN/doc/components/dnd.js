import React, { Component } from "react";

import ReactDom from "react-dom";
import { DraggableTable } from "tablex";
import { Input, Button } from "antd";
import update from "immutability-helper";

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

const arrayMove = (array, from, to) => {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
};

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    let columns = [
      {
        dataIndex: "column-1",
        key: "column-1",
        title: "column-1",
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
        width: 150,
        dataIndex: "column-2",
        title: "column-2"
      },
      {
        width: 150,
        dataIndex: "column-3",
        title: "column-3"
      },
      {
        width: 150,
        dataIndex: "column-4",
        title: "column-4"
      }
    ];

    const data = generateData(columns, 10);
    data[3].children = generateData(columns, 10, "children-");
    data[3].children[2].children = generateData(
      columns,
      10,
      "children-children-"
    );

    this.setState({
      data: data,
      columns: columns
    });
  }

  onSortEnd({ newIndex, oldIndex }) {
    this.setState(({ data }) => ({
      data: arrayMove(data, oldIndex, newIndex)
    }));
  }

  onDrop = d => {
   // console.log("onDrop:", d);
    let { source, target } = d;

    // let data = update(this.state.data, {
    //   $splice: [[source.index, 1], [target.index, 0, target.data]]
    // });

  //  console.log("onDrop:", data);
  };

  scrollToItem = () => {
    console.log("scrollToItem2:", this.tableRef);
    if (this.tableRef) {
      this.tableRef.api.scrollToItem(50);
    }
  };

  render() {
    return (
      <DraggableTable
        rowKey="id"
        expandColumnKey="column-1"
        header={() => <div onClick={this.scrollToItem}>a</div>}
        editable={true}
        virtual={!!this.props.virtual}
        columns={this.state.columns}
        selectMode="none"
        data={this.state.data}
        orderNumber={true}
        onDrop={this.onDrop}
        tableRef={ins => (this.tableRef = ins)}
      />
    );
  }
}

export default Demo;
