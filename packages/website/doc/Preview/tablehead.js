import React, { Component } from "react";
import { Table } from "tablex";
import { Button, Popover } from "antd";

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
    let columns = [
      {
        title: "id",
        key: "id",
        children: [
          {
            dataIndex: "id-1",
            title: "id-1",
            key: "id-1", 
            children: [
              {
                dataIndex: "id-1-1",
                title: "id-1-1",
                key: "id-1-1"
              },
              {
                dataIndex: "id-2",
                title: "id-2",
                key: "id-2"
              }
            ]
          }
        ]
      },
      {
        dataIndex: "column3",
        key: "column3",
        title: "column3",
      

        children: [
          {
            dataIndex: "column3-1",
            title: "column3-1",
            key: "column3-1",
            rowSpan:2,

            children: [
              {
                dataIndex: "column3-1-1",
                title: "column3-1-1",
                key: "column3-1-1",
              

              }
            ]
          }
        ]
      },
      {
        dataIndex: "column4",
        key: "column4",
        title: "column4",
        minWidth: 300
      }
      
    ];

 
    let columns2= [{
        "title": "项目名称",
        "dataIndex": "TendersName",
        "key": "TendersName",
        "width": 200,
        "hidden": false,
        rowSpan: 2,
        children: [{
            title: "名称1",
            dataIndex: "name1"
        }]
    }, {
        "title": "合同编号",
        "dataIndex": "ContractNO",
        "key": "ContractNO",
        "hidden": false,
        "width": 200
    }, {
        "title": "合同名称",
        "dataIndex": "ContractName",
        "key": "ContractName",
        "hidden": false
    }, {
        "title": "合同签订情况",
        "children": [{
            "title": "钢材",
            "colSpan": 2,
            "children": [{
                "title": "钢材数量",
                "dataIndex": "ContractQty_0",
                "key": "ContractQty_0",
                "hidden": false
            }, {
                "title": "钢材金额",
                "dataIndex": "ContractMoney_0",
                "key": "ContractMoney_0",
                "hidden": true
            }]
        }, {
            "title": "水泥",
            "children": [{
                "title": "水泥数量",
                "dataIndex": "ContractQty_1",
                "hidden": false
            }, {
                "title": "水泥金额",
                "dataIndex": "ContractMoney_1",
                "hidden": false
            }]
        }, {
            "title": "红砖",
            "children": [{
                "title": "红砖数量",
                "dataIndex": "ContractQty_11",
                "hidden": false
            }, {
                "title": "红砖金额",
                "dataIndex": "ContractMoney_111",
                "hidden": false
            }]
        }]
    }, {
        "title": "实际供应情况",
        "children": [{
            "title": "钢材",
            "children": [{
                "title": "数量",
                "dataIndex": "SettleQty_0",
                "key": "SettleQty_0",
                "hidden": false
            }, {
                "title": "供应金额",
                "dataIndex": "SettleMoney_0",
                "key": "SettleMoney_0",
                "hidden": false
            }]
        }, {
            "title": "水泥",
            "children": [{
                "title": "数量",
                "dataIndex": "SettleQty_1",
                "key": "SettleQty_1",
                "hidden": false
            }, {
                "title": "供应金额",
                "dataIndex": "SettleMoney_1",
                "key": "SettleMoney_1",
                "hidden": false
            }]
        }, {
            "title": "合计",
            "children": [{
                "title": "供应金额",
                "dataIndex": "TotalSettleMoney",
                "key": "TotalSettleMoney",
                "hidden": false
            }, {
                "title": "增值税率",
                "dataIndex": "TaxRate",
                "key": "TaxRate",
                "hidden": false
            }, {
                "title": "不含税收入",
                "dataIndex": "NoTaxTotalSettleMoney",
                "key": "NoTaxTotalSettleMoney",
                "hidden": false
            }]
        }]
    }, {
        "title": "核实情况",
        "dataIndex": "CheckSituation",
        "key": "CheckSituation",
        "width": 120,
        "hidden": true
    }, {
        "title": "核实结果",
        "dataIndex": "CheckResult",
        "key": "CheckResult",
        "width": 100,
        "hidden": true
    }, {
        "title": "差额",
        "dataIndex": "Imbalance",
        "key": "Imbalance",
        "width": 100,
        "hidden": true
    }, {
        "title": "说明",
        "dataIndex": "Remark",
        "key": "Remark",
        "width": 200,
        "hidden": true
    }, {
        "align": "left",
        "fixed": "right",
        "dataIndex": "",
        "hidden": true,
        "key": "action",
        "title": "操作",
        "export": false,
        "width": 120
    }]
    
    columns=columns2;
    

    let data = this.generateData(columns, 120);

    data[0].children = this.generateData(columns, 5, "Row-0-children-");
    data[0].children[0].children = this.generateData(
      columns,
      5,
      "Row-0-children-0-"
    );

    data[3].children = this.generateData(columns, 5, "Row-3-children-");
    data[3].children[0].children = this.generateData(
      columns,
      5,
      "Row-3-children-0-"
    );

    this.state = {
      data: data,
      selectedRowKeys: [],
      columns: columns
    };
  }

  onBeforeAdd = () => {
    console.log("asd");
    this.setState({});
    return true;
  };

  onSelectChange = selectedRowKeys => {
    console.log("onSelectChange")
    this.setState({
      selectedRowKeys: selectedRowKeys
    });
  };

  render() {
    let { columns, data } = this.state;
    console.log("columns:", columns);

    return (
      <div style={{ height: 600 }}>
        <Popover
          trigger="click"
          content={<div style={{ height: 300, width: 300 }}></div>}
        >
          <Button>click</Button>
        </Popover>

        <Table
          bordered={true}
          autoRowHeight={true}
          editable={true}
          autoHeight={false}
          orderNumber={false}
          virtual={true}
          editAll={true}
          ref="table"
          rowKey="id"
          columns={columns}
          dataSource={data}
          editTools={["edit", "add", "delete"]}
          selectMode="multiple"
          defaultAddCount={1}
          isAppend={false}
          validateTrigger="onChange"
          onBeforeAdd={this.onBeforeAdd}
          onBeforeEdit={this.onBeforeAdd}
          onEditSave={this.onEditSave}
          onCancel={this.onCancel}
          onSelectChange={this.onSelectChange}
          rowSelection={{
            type: "none",
            checkOnSelect: true,
            selectOnCheck: true,
            selectType: "none",
            onChange: this.onSelectChange,
            selectedRowKeys: this.state.selectedRowKeys
          }}
        />
      </div>
    );
  }
}

export default Demo;
