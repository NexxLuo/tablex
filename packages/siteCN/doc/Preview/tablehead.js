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
            onHeaderCell: function() {
              return {
                style: {
                  minHeight: 40
                }
              };
            },
            children: [
              {
                dataIndex: "id-1-1",
                title: "id-1-1",
                key: "id-1-1",
                editor: function() {
                  return "editor";
                }
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
        render:(v,r,i)=>{

          let strArr=new Array(10+i*10).fill("a").join("");

        return <div>{strArr}</div>
        }
      },
      {
        dataIndex: "column4",
        key: "column4",
        title: "column4",
        minWidth: 300
      },
      {
        dataIndex: "column1",
        key: "column1",
        title: "column1",

        children: [
          {
            dataIndex: "column1-1",
            title: "column1-1",
            key: "column1-1",
            children: [
              {
                dataIndex: "column1-1-1",
                title: "column1-1-1",
                key: "column1-1-1"
              }
            ]
          },
          {
            dataIndex: "column1-2",
            title: "column1-2",
            key: "column1-2",
            children: [
              {
                dataIndex: "column1-2-1",
                title: "column1-2-1",
                key: "column1-2-1"
              }
            ]
          }
        ]
      }
    ];

    let columns2 = [
      {
        key: "Title1",
        dataIndex: "Title1",
        title: "Title1",
        widget: 100,
        colSpan: 4,

        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {}
          };
          if (index === 0) {
            obj.props.rowSpan = 7;
          }
          if (index === 7) {
            obj.props.rowSpan = 11;
          }
          if (index === 18) {
            obj.props.rowSpan = 2;
          }
          if (index === 20) {
            obj.props.rowSpan = 2;
          }
          obj.children = (
            <div style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}>
              {value}{" "}
            </div>
          );
          return obj;
        }
      },
      {
        key: "Title2",
        title: "Title2",
        dataIndex: "Title2",
        widget: 100,
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {}
          };
          if (index === 0) {
            obj.props.rowSpan = 5;
          }
          if (index === 5) {
            obj.props.rowSpan = 2;
          }
          if (index === 7) {
            obj.props.rowSpan = 9;
          }
          if (index === 16) {
            obj.props.rowSpan = 2;
          }
          if (index > 17) {
            obj.props.colSpan = 2;
          }
          obj.children = (
            <div style={{ whiteSpace: "pre-line", wordWrap: "break-word" }}>
              {value}{" "}
            </div>
          );
          return obj;
        }
      },
      {
        key: "Title3",
        title: "Title3",
        dataIndex: "Title3",
        width: 280
      },
      {
        key: "Sort",
        title: "Sort",
        dataIndex: "Sort",
        width: 40
      },
      {
        key: "KJZZSZYP",
        title: "开具增值税专用发票",

        children: [
          {
            key: "XSE",
            title: "销售额",
            children: [
              {
                key: "XSE1",
                title: "1",
                children: [
                  {
                    dataIndex: "VATSalesMoney",
                    key: "VATSalesMoney",
                    title: "VATSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "XXSE",
            title: "销项(应纳)税额",
            children: [
              {
                // dataIndex: 'XXSE2',
                key: "XXSE2",
                title: "2",
                children: [
                  {
                    dataIndex: "VATSalesTaxMoney",
                    key: "VATSalesTaxMoney",
                    title: "VATSalesTaxMoney",
                    width: 120
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "KJQTFP",
        title: "开具其他发票",
        children: [
          {
            key: "QTXSE",
            title: "销售额",
            children: [
              {
                key: "XSE3",
                title: "3",
                children: [
                  {
                    dataIndex: "OtherSalesMoney",
                    key: "OtherSalesMoney",
                    title: "OtherSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "QTXXSE1",
            title: "销项(应纳)税额",
            children: [
              {
                key: "XXSE4",
                title: "4",
                children: [
                  {
                    dataIndex: "OtherSalesTaxMoney",
                    key: "OtherSalesTaxMoney",
                    title: "OtherSalesTaxMoney",
                    width: 120
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "WKJFP",
        title: "未开具发票",
        children: [
          {
            key: "WKJFPXSE",
            title: "销售额",
            children: [
              {
                key: "WKJFPXSE5",
                title: "5",
                children: [
                  {
                    dataIndex: "NotWriteSalesMoney",
                    key: "NotWriteSalesMoney",
                    title: "NotWriteSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "WKJFPXXSE6",
            title: "销项(应纳)税额",
            children: [
              {
                key: "WKJFPXXSE6",
                title: "6",
                children: [
                  {
                    dataIndex: "NotWriteSalesTaxMoney",
                    key: "NotWriteSalesTaxMoney",
                    title: "NotWriteSalesTaxMoney",
                    width: 120
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "NSJCTZ",
        title: "纳税检查调整",
        children: [
          {
            key: "NSJCTZXSE",
            title: "销售额",
            children: [
              {
                // dataIndex: 'NSJCTZXSE7',
                key: "NSJCTZXSE7",
                title: "7",
                children: [
                  {
                    dataIndex: "TaxCheckSalesMoney",
                    key: "TaxCheckSalesMoney",
                    title: "TaxCheckSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "NSJCTZXSE8",
            title: "销项(应纳)税额",
            children: [
              {
                // dataIndex: 'NSJCTZXSE8',
                key: "NSJCTZXSE8",
                title: "8",
                children: [
                  {
                    dataIndex: "TaxCheckSalesTaxMoney",
                    key: "TaxCheckSalesTaxMoney",
                    title: "TaxCheckSalesTaxMoney",
                    width: 120
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "HJ",
        title: "合计",
        children: [
          {
            key: "QTXSE2",
            title: "销售额",
            children: [
              {
                // dataIndex: 'XSE9',
                key: "XSE9",
                title: "9=1+3+5+7",
                children: [
                  {
                    dataIndex: "TotalSalesMoney",
                    key: "TotalSalesMoney",
                    title: "TotalSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "QTXXSE",
            title: "销项(应纳)税额",
            children: [
              {
                // dataIndex: 'XXSE10',
                key: "XXSE10",
                title: "10=2+4+6+8",
                children: [
                  {
                    dataIndex: "TotalSalesTaxMoney",
                    key: "TotalSalesTaxMoney",
                    title: "TotalSalesTaxMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "JSHJ",
            title: "价税合计",
            children: [
              {
                // dataIndex: 'XXSE11',
                key: "XXSE11",
                title: "11=9+10",
                children: [
                  {
                    dataIndex: "TotalMoney",
                    key: "TotalMoney",
                    title: "TotalMoney",
                    width: 120
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "FWBDC",
        title: "服务、不动产和无形资产扣除项目本期实际扣除金额",
        rowSpan: 2,
        children: [
          {
            key: "1222",
            children: [
              {
                key: "12",
                title: "12",
                children: [
                  {
                    dataIndex: "ServiceDeductionMoney",
                    key: "ServiceDeductionMoney",
                    title: "ServiceDeductionMoney",
                    width: 340
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: "KCH",
        title: "扣除后",
        children: [
          {
            key: "XXS13",
            title: "含税(免税)销售额",
            children: [
              {
                // dataIndex: 'XXS13',
                key: "XXS1313",
                title: "13=11-12",
                children: [
                  {
                    dataIndex: "AfterDeductionSalesMoney",
                    key: "AfterDeductionSalesMoney",
                    title: "AfterDeductionSalesMoney",
                    width: 120
                  }
                ]
              }
            ]
          },
          {
            key: "XXSE14",
            title: "销项(应纳)税额",
            children: [
              {
                // dataIndex: 'XXSE14',
                key: "XXSE1414",
                title: "14=13÷(100% +税率或征收率)×税率或征收率",
                children: [
                  {
                    dataIndex: "AfterDeductionSalesTaxMoney",
                    key: "AfterDeductionSalesTaxMoney",
                    title: "AfterDeductionSalesTaxMoney",
                    width: 250
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

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
          rowSelection={{
            type: "radio",
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
