import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox, Input, Button, message, notification, Modal } from "antd";

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

  expandedRowRender2 = (record, index, extra) => {
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
    render: (value, row, index, extra) => {
      let { orders = [] } = extra;
      return orders.join("-");
    }
  };

  selectionColumn = {
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
   Modal.confirm({
      width: "100%",
      closable:false,
      style: {
        top: 0,
        width: "100%"
      },
      title:"新增成功",
      getContainer:()=>{
        return this.refs.container
      }
    });


    return;

    notification.success({
      className: "notification-message",
      style: {},
      getContainer: () => {
        return this.refs.container;
      },
      duration: 200,
      message: "成功了"
    });

    message.success({
      className: "notification-message",
      style: {},
      getContainer: () => {
        console.log("asdsd");
        return this.refs.container;
      },
      duration: 200,
      content: "成功了"
    });

    this.tableRef.current.scrollToItem(12, "smart");
  };

  scrollToItem2 = () => {
    this.tableRef2.current.scrollToItem(12, "smart");
  };

  getDtlColumns() {
    let dtlColumns = [
      {
        title: "货物或应税劳务、服务名称",
        dataIndex: "Goods"
      },
      {
        title: "规格型号",
        dataIndex: "Spec"
      },
      {
        title: "单位",
        dataIndex: "Unit"
      },
      {
        title: "数量",
        dataIndex: "Qty"
      },
      {
        title: "单价",
        dataIndex: "Price"
      },
      {
        title: "金额",
        dataIndex: "NoTaxMoney"
      },
      {
        title: "税率",
        dataIndex: "Tax"
      },
      {
        title: "税额",
        dataIndex: "TaxMoney"
      }
    ];
    return dtlColumns;
  }
  expandedRowRender = (record, i, extra) => {

    if (extra.frozen!=="none") {
      return null;
    }
    let dtlColumns = this.getDtlColumns();
    const { list, selectedKeysDtl = [] } = this.state;
    let dataSource = [];
    for (i = 0; i < 10; i++) {
      dataSource.push({
        Goods: "*橡胶制品*皮带" + i,
        InvoiceId: "E4FE4FE5-25FA-45AB-9FAD-2E09A863EBAA",
        NoTaxMoney: 920.35,
        Price: 92.04,
        Qty: 10,
        Sort: 0,
        Spec: "2700/100/4",
        Tax: 0.13,
        TaxMoney: 119.65,
        Unit: "条",
        VATInvoiceDtlId: i
      });
    }
    const jsx = (
      <div    style={{ padding: "5px 5px 5px 5px", height: "100%"}}>
      <div
        style={{ height: "100%",overflow:"auto" }}
        onMouseOver={e => e.stopPropagation()}
        onMouseOut={e => e.stopPropagation()}
      >
        <Table
          columns={dtlColumns}
          rowKey="VATInvoiceDtlId"
          dataSource={dataSource}
          showPagination={false}
          selectMode="multiple"
          autoRowHeight={true}
          test="test"
          autoHeight={true}
          selectOnRowClick={false}
          onSelectChange={this.onSelectChangeDtl}
          selectedRowKeys={selectedKeysDtl}
        />
      </div></div>
    );
    return jsx;
  };

  render() {
    let columns = this.getDtlColumns();
    return (
      <>
        <Button onClick={this.scrollToItem1}>scrollToItem</Button>

        <div style={{ height: "800px", marginTop: 10 }} ref="container">
          <Table
            loading={this.state.loading}
            editTools={["edit", "add", "delete"]}
            multipleSort={true}
            onSort={a => {
              // this.setState({data:[]})
              console.log("onSort:", a);
            }}
            tableId="preview_table"
            sortable={true}
            editable={true}
            isAppend={true}
            allowSaveEmpty={true}
            overscanCount={100}
            alwaysValidate={true}
            rowKey="id"
            onEditSave={this.onEditSave}
            ref={this.tableRef}
            columns={columns}
            autoRowHeight={true}
            autoHeight={true}
            expandRowHeight={400}
            hoverable={true}
            expandedRowRender={this.expandedRowRender}
            checkStrictly={true}
            disabledSelectKeys={["0"]}
            selectOnRowClick={false}
            selectMode="multiple"
            defaultExpandedRowKeys={["0"]}
            data={this.state.data}
            onExpand={(b, r) => {
              //  console.log("onExpand:", r);
            }}
            onSelectChange={this.onSelectChange}
          />
        </div>
      </>
    );
  }
}

export default Demo;
