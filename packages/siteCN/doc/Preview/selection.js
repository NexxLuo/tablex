import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox, Input, Button, Table as AntdTable } from "antd";

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
        // obj.props.rowSpan = 13;
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
            //  obj.props.rowSpan = 3;
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

function TestTitleFn(params) {
  return <span>a</span>;
}

class TestTitleClass extends React.Component {
  render() {
    return <span>a</span>;
  }
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
        title: "column-1"
      },

      {
        dataIndex: "column-2",
        key: "column-2",
        title: "column-2",
        width: 150,
        align: "center"
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
      total: data.length
    };
  }

  onPageChange(pageIndex, pageSize) {
    this.setState({
      current: pageIndex,
      pageSize
    });
  }

  onRefresh(pageIndex, pageSize) {
    this.setState({
      current: pageIndex,
      pageSize
    });
  }

  getRowSelection() {
    return {
      type: "checkbox",
      selectMode: "single",
      checkMode: "single",
      showCheckbox: true,
      selectOnCheck: false,
      checkOnSelect: true,
      fixed: true,
      onBeforeSelect: () => {
        // console.log("onBeforeSelect");
        return true;
      },

      onSelectChange: () => {
        console.log("onSelectChange");
      },

      onSelect: () => {
        console.log("onSelect");
      },
      onCheck: () => {
        console.log("onCheck");
      },
      onChange2: () => {
        console.log("onChange");
      },
      onCheckAll2: () => {
        console.log("onCheckAll");
      },
      onBeforeCheck: () => {
        console.log("onBeforeCheck");
        return true;
      },
      onBeforeCheckAll: () => {
        console.log("onBeforeCheckAll");
        return true;
      },
      getCheckboxProps: r => {
        return {
          disabled: false
        };
      }
    };
  }

  getRowSelection2() {
    return {
      type: "checkbox",
      columnTitle: <span>2</span>,
      getCheckboxProps: r => {
        return {
          disabled: false
        };
      }
    };
  }

  contextMenu = row => {
    console.log("contextMenu:", row && row.id);

    if (row && row.id === "Row 4 - Col 0") {
      return <div>asadasd</div>;
    }
    return null;
  };

  render() {
    let { columns, data, current, pageSize, total } = this.state;

    return (
      <>
        <Input.Search
          onChange={() => console.log("onchange")}
          allowClear={true}
        ></Input.Search>
        <div>
          <Table
            rowKey="id"
            editable={true}
            columns={columns}
            autoHeight={true}
            selectMode="multiple"
            checkStrictly={true}
            disabledSelectKeys={[data[0].id]}
            onSelectChange={function(a, b, c, d) {
              console.log("onSelectChange");
              return true;
            }}
            onSelect={function(a, b, c, d) {
              console.log("onSelect");
              return true;
            }}
            onBeforeSelect={function(a, b, c, d) {
              console.log("onBeforeSelect");
              return true;
            }}
            onUnSelect={function(a, b, c, d) {
              console.log("onUnSelect");
              return true;
            }}
            onBeforeSelectAll={function(a, b, c, d) {
              console.log("onBeforeSelectAll");
              return true;
            }}
            onSelectAll={function(a, b, c, d) {
              console.log("onSelectAll");
              return true;
            }}
            onUnSelectAll={function(a, b, c, d) {
              console.log("onUnSelectAll");
              return true;
            }}
       
            data={data}
            selectOnRowClick={true}
            rowSelection2={this.getRowSelection()}
            pagination2={{
              current,
              pageSize,
              total,
              onPageChange: this.onPageChange.bind(this),
              onRefresh: this.onRefresh.bind(this)
            }}
          />
        </div>
      </>
    );
  }
}

export default Demo;
