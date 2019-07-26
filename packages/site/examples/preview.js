import React, { Component } from "react";
import { Table } from "tablex";

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
const data = generateData(columns, 100);

let fixedColumns = columns.map((column, columnIndex) => {
  let fixed;
  if (columnIndex < 2) fixed = "left";
  if (columnIndex > 8) fixed = "right";

  return { ...column, resizable: true, fixed };
});

fixedColumns = [
  {
    dataIndex: "column-1",
    key: "column-1",
    title: () => {
      return "fn title";
    },
    titleRender: () => {
      return <div>titleRender</div>;
    },
    width: 100,
    align: "left",
    halign: "center",
    fixedable: false,
    fixed: "left",
    render: function(a, b, c, d) {
      return a;
    }
  },
  {
    title: "appellation",
    width: 150,
    key: "column-11",
    halign: "left",
    children: [
      {
        dataIndex: "address",
        title: "name",
        key: "column-2",

        width: 150
      },
      {
        dataIndex: "id",
        key: "column-3",
        title: "nick name",
        width: 150,
        children: [
          {
            dataIndex: "id",
            title: "nick-1",
            key: "column-21",
            maxWidth: 300,
            width: 150
          },
          {
            dataIndex: "column-31",
            key: "column-31",
            title: "nick-2"
          }
        ]
      }
    ]
  },
  {
    dataIndex: "age",
    key: "column-4",
    title: "age",
    fixed: "right"
  }
];

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

class Demo extends Component {
  state = {
    data: [],
    loading: false,
    expandedRowKeys: []
  };

  componentDidMount() {
    this.setState({
      data: createTreeData()
    });
  }

  expandedRowRender = (record, index, extra) => {
    if (extra.frozen === "none") {
      return <div>expandedRowRender{new Date().getTime()}</div>;
    }
    return null;
  };

  onExpandedRowsChange = arr => {
    this.setState({ expandedRowKeys: arr });
  };

  tableInner = null;
  innerRef = ins => {
    this.tableInner = ins;
  };

  scrollToItem = () => {
    if (this.tableInner) {
      this.tableInner.scrollToItem(13);
    }
  };

  getData = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, data: createTreeData() });
    }, 1000);
  };

  onSelectChange = (a, b, c) => {
    console.log("onSelectChange:", b);
  };

  orderNumber = {
    title: "排序",
    width: 50,
    align: "left",
    resizable: true,
    fixed:"left",
    render: (value, row, index, extra) => {
      let { orders } = extra;
      return orders.join("-");
    }
  };

  selectionColumn={
    fixed:"left"
  }

  render() {
    return (
      <>
        <div>
          <span onClick={this.scrollToItem} style={{ cursor: "pointer" }}>
            scroll to item
          </span>
          <span
            onClick={this.getData}
            style={{ cursor: "pointer", marginLeft: 10 }}
          >
            get data
          </span>
        </div>
        <div>
          <Table
            loading={this.state.loading}
            tableId="preview_table"
            rowKey="id"
            innerRef={this.innerRef}
            columns={fixedColumns}
            checkStrictly={true}
            selectMode="multiple"
            defaultExpandedRowKeys={["0"]}
            data={this.state.data}
            onExpand={(b, r) => {
              console.log("onExpand:", r);
            }}
            onExpandedRowsChange={this.onExpandedRowsChange}
            onSelectChange={this.onSelectChange}
            rowClassName={() => {
                console.log("rowClassName");
            }}
            orderNumber={this.orderNumber}
            selectionColumn={this.selectionColumn}
            rowHeight={(d, i) => {
              if (i % 2 === 0) {
                return 50;
              } else {
                return 30;
              }
            }}
            expandRowHeight={200}
            minHeight={600}
          />
        </div>
      </>
    );
  }
}

export default Demo;
