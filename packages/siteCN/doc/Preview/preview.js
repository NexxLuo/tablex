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
const data = generateData(columns, 100);

let fixedColumns = [
  {
    dataIndex: "column-1",
    key: "column-1",
    title: <span>标签title</span>,
    titleRender: () => {
      return <span>titleRender</span>;
    },
    align: "left",
    halign: "center",
    minWidth: 300,
    validator: function(value, row) {
      if (!value) {
        return { valid: false, message: "请输入" };
      }

      return { valid: true, message: "false" };
    },
    editor: function(value, row, index, onchange, ref) {
      let el = (
        <Input
          defaultValue={value}
          ref={ref}
          onChange={e => onchange({ "column-1": e.target.value })}
        />
      );

      const obj = {
        children: el,
        props: {}
      };

      if (index === 1) {
        obj.props.colSpan = 2;
        obj.children = el;
      }

      return obj;
    },
    render: (value, row, index) => {
      const obj = {
        children: value,
        props: {}
      };

      if (index % 20 === 0) {
        obj.props.rowSpan = 13;
        obj.children = value;
      }

      return obj;
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
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {}
          };
    
          if (index % 5 === 0) {
            obj.props.rowSpan = 3;
            obj.children = value;
          }
    
          return obj;
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
            width: 150,
            sortable: true
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
    // let childrens = createData(0, i, 2);
    let d = {
      id: "" + i,
      level: 0,
      "column-1": "Edward King " + i,
      age: i,
      address: "London, Park Lane no. " + i
    };

    if (i % 3 === 0) {
      // d.children = childrens;
    }

    data.push(d);
  }

  return data;
}

class Demo extends Component {
  tableRef = React.createRef();
  tableRef2 = React.createRef();

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

  edit = () => {
    if (this.tableRef.current) {
      this.tableRef.current.api.editRows(["2"]);
    }
  };

  add = () => {
    if (this.tableRef.current) {
      this.tableRef.current.api.insertData({
        data: [{ id: "inserted_row_" + new Date().getTime() }],
        parentKey: "3",
        editing: true,
        prepend: false,
        startIndex: 2
      });
    }
  };

  delete = () => {
    if (this.tableRef.current) {
      this.tableRef.current.api.delete();
    }
  };

  onSelectChange = (a, b, c) => {
    //console.log("onSelectChange:", b);
  };

  orderNumber = {
    title: "排序",
    width: 50,
    align: "left",
    resizable: true,
    fixed: "left",
    render: (value, row, index, extra) => {
      let { orders = [] } = extra;
      return orders.join("-");
    }
  };

  selectionColumn = {
    fixed: "left",
    title: attrs => {
      return (
        <Checkbox
          {...attrs}
          disabled={true}
          onChange={e => {
            attrs.onChange(e.target.checked);
          }}
        />
      );
    },
    render: (row, index, extra) => {
      return (
        <Checkbox
          {...extra}
          onChange={e => {
            extra.onChange(e.target.checked);
          }}
        />
      );
    }
  };

  onEditSave = (changedRows, newRows) => {
    console.log("onEditSave changedRows:", changedRows);
    console.log("onEditSave newRows:", newRows);

    this.setState({ data: newRows });
  };

  scrollToItem1 = () => {
    this.tableRef.current.scrollToItem(12, "smart");
  };

  scrollToItem2 = () => {
    this.tableRef2.current.scrollToItem(12, "smart");
  };

  render() {
    return (
      <>
        <Button onClick={this.scrollToItem1}>scrollToItem</Button>

        <div style={{ height: "800px", marginTop: 10 }}>
          <Table
            loading={this.state.loading}
            editTools={["edit", "add", "delete"]}
            tableId="preview_table"
            sortable={false}
            editable={true}
            isAppend={true}
            allowSaveEmpty={true}
            overscanCount={100}
            alwaysValidate={true}
            rowKey="id"
            onEditSave={this.onEditSave}
            ref={this.tableRef}
            columns={fixedColumns}
            checkStrictly={true}
            selectMode="multiple"
            selectOnRowClick={true}
            defaultExpandedRowKeys={["0"]}
            data={this.state.data}
            onExpand={(b, r) => {
              //  console.log("onExpand:", r);
            }}
            onExpandedRowsChange={this.onExpandedRowsChange}
            onSelectChange={this.onSelectChange}
            rowClassName={() => {
              // console.log("rowClassName");
            }}
            orderNumber={this.orderNumber}
            selectionColumn={this.selectionColumn}
            summary={{
              style: { border: "none" },
              title: { text: "合计:", column: "__checkbox_column" },
              data: [
                {
                  age: "sum",
                  level: "min"
                }
              ],
              render: (value, dataIndex, type, index) => {
                return type + ":" + value;
              }
            }}
            frozenRender={{
              rowHeight: 40,
              rowKey: "id",
              bottom: [this.state.data[0]],
              cellRender: (value, row, index, extra) => {
                console.log("cellRender:", extra);
                return value;
              }
            }}
            onRow2={(row, index, extra) => {
              if (index === 4) {
                return {
                  style: { position: "sticky", top: 0, zIndex: 2 }
                };
              } else {
                if (index < 4) {
                  return {
                    style: { top: extra.style.top + 50 }
                  };
                }
              }
            }}
            footerExtra={() => {
              return <div style={{ padding: "14px 10px" }}>底部信息展示</div>;
            }}
            rowHeight2={(d, i) => {
              if (i % 2 === 0) {
                return 50;
              } else {
                return 30;
              }
            }}
            expandRowHeight={200}
            headerRowHeight={[30, 40, 60]}
          />
        </div>

        <Button onClick={this.scrollToItem2} style={{ marginTop: 10 }}>
          scrollToItem
        </Button>
        {/* 
        <div style={{ height: "600px", marginTop: 10 }}>
          <Table
            loading={this.state.loading}
            virtual={false}
            editTools={["edit", "add", "delete"]}
            tableId="preview_table"
            editable={true}
            isAppend={true}
            allowSaveEmpty={true}
            alwaysValidate={true}
            ref={this.tableRef2}
            rowKey="id"
            onEditSave={this.onEditSave}
            innerRef={this.innerRef}
            columns={fixedColumns}
            checkStrictly={true}
            selectMode="multiple"
            selectOnRowClick={false}
            defaultExpandedRowKeys={["0"]}
            data={this.state.data}
            onExpand={(b, r) => {
              //  console.log("onExpand:", r);
            }}
            onExpandedRowsChange={this.onExpandedRowsChange}
            onSelectChange={this.onSelectChange}
            rowClassName={() => {
              // console.log("rowClassName");
            }}
            orderNumber={this.orderNumber}
            selectionColumn={this.selectionColumn}
            summary={{
              style: { border: "none" },
              title: { text: "合计:", column: "__checkbox_column" },
              data: [
                {
                  age: "sum",
                  level: "min"
                }
              ],
              render: (value, dataIndex, type, index) => {
                return type + ":" + value;
              }
            }}
            frozenRender={{
              rowHeight: 40,
              rowKey: "id",
              bottom: [this.state.data[0]],
              cellRender: (value, row, index, extra) => {
                console.log("cellRender:", extra);
                return value;
              }
            }}
            onRow2={(row, index, extra) => {
              if (index === 4) {
                return {
                  style: { position: "sticky", top: 0, zIndex: 2 }
                };
              } else {
                if (index < 4) {
                  return {
                    style: { top: extra.style.top + 50 }
                  };
                }
              }
            }}
            footerExtra={() => {
              return <div style={{ padding: "14px 10px" }}>底部信息展示</div>;
            }}
            rowHeight2={(d, i) => {
              if (i % 2 === 0) {
                return 50;
              } else {
                return 30;
              }
            }}
            expandRowHeight={200}
            headerRowHeight={[30, 40, 60]}
          />
        </div> */}
      </>
    );
  }
}

export default Demo;
