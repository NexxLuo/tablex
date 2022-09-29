import React, { Component } from 'react';
import { Table, unflatten } from 'tablex';
import { Checkbox , Input, Menu, InputNumber } from 'antd';
import _ from 'lodash';
import 'antd/dist/antd.css';

const { Search } = Input;

const colWidth = {
  normal: 120,
  middle:200,
  qty:120,
  price:90,
  money:200,
  taxMoney:200,
  percent:100,
  cmp:100,
  tag:100,
  name_s:200,
  remark:200
}

const align = {
  wordAlign: "left"
}
class Demo extends Component {
  state = {
    loading: false,
    data: [],
    columns: [],
  };

  columns=[];

  constructor(props) {
    super(props);
    this.columns = [{
      dataIndex: "LabourCode",
      title: "费用编码",
      width: colWidth.normal,
      align: align.wordAlign,
      editor: (value, row, index, onchange, ref) => {
        return <Input
          value={value}
          ref={ref}
          maxLength={100}
          onChange={(e) => {
            onchange({ "LabourCode": e.target.value }, row, index)
          }}>
        </Input>
      }
    }, {
      dataIndex: "LabourName",
      title: "费用名称",
      width: colWidth.normal,
      align: align.wordAlign,
      validator: (value, row) => {

        return { valid: true, message: "" }
      },
      editor: (value, row, index, onchange, ref) => {

        return <Search
          allowClear

          onChange={v => {

          }}
          value={value}
        />
      }
    }, {
      dataIndex: "WorkContent",
      title: "工作内容",
      width: colWidth.middle,
      align: align.wordAlign,
      validator: (value, row) => {

        return { valid: true, message: "" };
      },

      editor: (value, row, index, onchange, ref) => {
        return <Input
          value={value}
          ref={ref}
          maxLength={1000}
          onChange={(e) => {
            onchange({ "WorkContent": e.target.value }, row, index)
          }}
        />;
      }
    }, {
      dataIndex: "UnitName",
      title: "计量单位",
      width: 125,//colWidth.unit,
      align: align.wordAlign,
      validator: (value, row) => {

        return { valid: true, message: "" };
      },

    }, {
      align: align.numberAlign,
      title: "余量",
      dataIndex: "InventorySurplusQty",
      width: colWidth.qty,

    }, {
      dataIndex: "Qty",
      title: "数量",
      width: colWidth.qty,
      align: align.numberAlign,

    }, {
      align: align.numberAlign,
      title: "指导价",
      dataIndex: "ControlPrice",
      width: colWidth.price,

    }, {
      title: '含税单价',
      dataIndex: 'RPrice',
      align: align.numberAlign,
      width: colWidth.price,
      renderText: (text, record) => {
        return text
      },

    }, {
      title: '不含税单价',
      dataIndex: 'RNoTaxPrice',
      align: align.numberAlign,
      width: colWidth.price,

    }, {
      title: '含税金额',
      dataIndex: 'RMoney',
      width: colWidth.money,
      align: align.numberAlign,

    }, {
      title: '不含税金额',
      dataIndex: 'RNoTaxMoney',
      width: colWidth.money,
      align: align.numberAlign,

    }, {
      title: '税额',
      dataIndex: 'RTaxMoney',
      width: colWidth.taxMoney,
      align: align.numberAlign,

    },
    {
      title: '税率',
      width: colWidth.percent,
      dataIndex: 'TaxRate',
      align: align.numberAlign,


    },
    {
      title: "可抵扣",
      dataIndex: "IsDeduction",
      align: align.cmpAlign,
      width: colWidth.cmp,
      render: (text, record) => {
        return (
          <Checkbox
            checked={text}
            disabled
          />
        );
      },
      renderText: (text, record) => {
        return text ? '是' : '否';
      }
    }, {
      title: '数据来源',
      dataIndex: 'ContractSource',
      width: colWidth.tag,
      align: align.cmpAlign,

      renderText: (text, record) => {
        return text;
      }
    }, {
      title: '清单',
      dataIndex: 'InventoryNO',
      width: colWidth.name_s,
      align: align.wordAlign,

      renderText: (text, record) => {
        return `${text} ${record.InventoryName}`;
      }
    }, {
      align: align.wordAlign,
      title: "全路径",
      dataIndex: "InventoryFullName",
      width: colWidth.name_s,
      // render:(text)=>{
      //     return "1"
      // }
    }, {
      dataIndex: "Remark",
      title: "备注",
      width: colWidth.remark,
      validator: (value, row) => {
        if (value && value.length > 500) {
          return { valid: false, message: "长度不能超过500位" };
        }
        return { valid: true, message: "" };
      },
      editor: (value, row, index, onchange, ref) => {
        return <Input
          defaultValue={value}
          value={value}
          ref={ref}
          maxLength={500}
          onChange={(e) => {
            onchange({ "Remark": e.target.value }, row, index)
          }}
        />;
      }
    },
    ];
 
    console.log("columns:",this.columns)

  }

  getData = () => {


    let arr = [{
      "ContractDtlID": "5daf46e0-b1f5-47fe-a197-d7c4ead3c24f",
      "ContractID": "789e214f-76e7-4b99-9f2d-8548a52c24e6",
      "LabourID": "64b8d8ef-8a7c-46f6-8a43-8553fe89d55e",
      "LabourCode": "TJZ",
      "LabourName": "砼浇筑",
      "WorkContent": null,
      "UnitID": null,
      "UnitName": "米",
      "Qty": 3.500000000000,
      "CurrencyID": null,
      "ExchangeRate": 0.000000,
      "ControlPrice": null,
      "RPrice": 103.000000000000,
      "RNoTaxPrice": 100.000000000000,
      "RMoney": 360.500000000000,
      "RNoTaxMoney": 350.000000000000,
      "RTaxMoney": 10.500000000000,
      "OPrice": 0.000000000000,
      "ONoTaxPrice": 0.000000000000,
      "OMoney": 0.000000000000,
      "ONoTaxMoney": 0.000000000000,
      "OTaxMoney": 0.000000000000,
      "IsDeduction": true,
      "TaxRate": 3.00,
      "CreateTime": "2022-04-28 15:51:08",
      "Remark": null,
      "Sort": 2,
      "ContractSource": 1,
      "InventoryQty": null,
      "InventoryTotalControlQty": 5.370000000000,
      "InventorySurplusQty": 5.370000000000,
      "RemainQty": null,
      "InventoryTotalID": "537acba5-b593-4cc0-8288-91809f47b1ec",
      "InventoryID": "3139656f-44bd-4aa8-b9b0-c22b7f58c028",
      "InventoryName": "工程量清单导入",
      "InventoryItemID": null,
      "InventoryNO": "QDDR-20220331-0005",
      "InventoryFullName": "(一)大渡河双线特大桥/Ⅰ.建筑工程费/6.预应力混凝土连续梁/(15)(28+48+27)m连续梁1联/2)预应力筋/砼浇筑",
      "InventoryType": "3",
      "PID": "7e3b78fd-3eae-455c-9754-40c77fe71533",
      "BiddingPlanDtlID": null,
      "BiddingPlanID": null,
      "BiddingPlanWFDtlID": null,
      "ParentCode": null
    }, {
      "ContractDtlID": "6c1c555f-c6db-47e4-a878-d3c481f3cd21",
      "ContractID": "789e214f-76e7-4b99-9f2d-8548a52c24e6",
      "LabourID": "64b8d8ef-8a7c-46f6-8a43-8553fe89d55e",
      "LabourCode": "TJZ",
      "LabourName": "砼浇筑",
      "WorkContent": null,
      "UnitID": null,
      "UnitName": "米",
      "Qty": 80.000000000000,
      "CurrencyID": null,
      "ExchangeRate": 0.000000,
      "ControlPrice": null,
      "RPrice": 103.000000000000,
      "RNoTaxPrice": 100.000000000000,
      "RMoney": 8240.000000000000,
      "RNoTaxMoney": 8000.000000000000,
      "RTaxMoney": 240.000000000000,
      "OPrice": 0.000000000000,
      "ONoTaxPrice": 0.000000000000,
      "OMoney": 0.000000000000,
      "ONoTaxMoney": 0.000000000000,
      "OTaxMoney": 0.000000000000,
      "IsDeduction": true,
      "TaxRate": 3.00,
      "CreateTime": "2022-04-28 15:51:08",
      "Remark": null,
      "Sort": 3,
      "ContractSource": 1,
      "InventoryQty": null,
      "InventoryTotalControlQty": 4559.700000000000,
      "InventorySurplusQty": 4559.700000000000,
      "RemainQty": null,
      "InventoryTotalID": "025fba97-e78e-4bf1-a690-117010ec8301",
      "InventoryID": "3139656f-44bd-4aa8-b9b0-c22b7f58c028",
      "InventoryName": "工程量清单导入",
      "InventoryItemID": null,
      "InventoryNO": "QDDR-20220331-0005",
      "InventoryFullName": "(一)大渡河双线特大桥/Ⅰ.建筑工程费/1.基础/(2)承台/①混凝土/砼浇筑",
      "InventoryType": "3",
      "PID": "c49040d7-a542-4af7-9391-9ee48b91591b",
      "BiddingPlanDtlID": null,
      "BiddingPlanID": null,
      "BiddingPlanWFDtlID": null,
      "ParentCode": null
    }, {
      "ContractDtlID": "6c58f1b6-25b9-441c-8787-3913e383e189",
      "ContractID": "789e214f-76e7-4b99-9f2d-8548a52c24e6",
      "LabourID": "317866dd-2e07-488b-9ca2-f24338f464bc",
      "LabourCode": "LW-SMXZ-0C2",
      "LabourName": "实木修整C2",
      "WorkContent": null,
      "UnitID": null,
      "UnitName": "米",
      "Qty": 4.000000000000,
      "CurrencyID": null,
      "ExchangeRate": 0.000000,
      "ControlPrice": null,
      "RPrice": 56.900000000000,
      "RNoTaxPrice": 55.242718446602,
      "RMoney": 227.600000000000,
      "RNoTaxMoney": 220.970000000000,
      "RTaxMoney": 6.630000000000,
      "OPrice": 0.000000000000,
      "ONoTaxPrice": 0.000000000000,
      "OMoney": 0.000000000000,
      "ONoTaxMoney": 0.000000000000,
      "OTaxMoney": 0.000000000000,
      "IsDeduction": true,
      "TaxRate": 3.00,
      "CreateTime": "2022-04-28 15:51:08",
      "Remark": null,
      "Sort": 0,
      "ContractSource": 1,
      "InventoryQty": null,
      "InventoryTotalControlQty": 5.370000000000,
      "InventorySurplusQty": 5.370000000000,
      "RemainQty": null,
      "InventoryTotalID": "aaa29e8c-ec41-403f-87c3-9b8a23ce5dda",
      "InventoryID": "3139656f-44bd-4aa8-b9b0-c22b7f58c028",
      "InventoryName": "工程量清单导入",
      "InventoryItemID": null,
      "InventoryNO": "QDDR-20220331-0005",
      "InventoryFullName": "(一)大渡河双线特大桥/Ⅰ.建筑工程费/6.预应力混凝土连续梁/(15)(28+48+27)m连续梁1联/2)预应力筋/实木修整C2",
      "InventoryType": "2",
      "PID": "7e3b78fd-3eae-455c-9754-40c77fe71533",
      "BiddingPlanDtlID": null,
      "BiddingPlanID": null,
      "BiddingPlanWFDtlID": null,
      "ParentCode": null
    }, {
      "ContractDtlID": "c413ac05-9739-4df4-be4a-a6e0617d2065",
      "ContractID": "789e214f-76e7-4b99-9f2d-8548a52c24e6",
      "LabourID": "317866dd-2e07-488b-9ca2-f24338f464bc",
      "LabourCode": "LW-SMXZ-0C2",
      "LabourName": "实木修整C2",
      "WorkContent": null,
      "UnitID": null,
      "UnitName": "米",
      "Qty": 100.000000000000,
      "CurrencyID": null,
      "ExchangeRate": 0.000000,
      "ControlPrice": null,
      "RPrice": 56.900000000000,
      "RNoTaxPrice": 55.242718446602,
      "RMoney": 5690.000000000000,
      "RNoTaxMoney": 5524.270000000000,
      "RTaxMoney": 165.730000000000,
      "OPrice": 0.000000000000,
      "ONoTaxPrice": 0.000000000000,
      "OMoney": 0.000000000000,
      "ONoTaxMoney": 0.000000000000,
      "OTaxMoney": 0.000000000000,
      "IsDeduction": true,
      "TaxRate": 3.00,
      "CreateTime": "2022-04-28 15:51:08",
      "Remark": null,
      "Sort": 1,
      "ContractSource": 1,
      "InventoryQty": null,
      "InventoryTotalControlQty": 4559.700000000000,
      "InventorySurplusQty": 4559.700000000000,
      "RemainQty": null,
      "InventoryTotalID": "760a71fa-575e-44f1-9cb5-a55bd45df205",
      "InventoryID": "3139656f-44bd-4aa8-b9b0-c22b7f58c028",
      "InventoryName": "工程量清单导入",
      "InventoryItemID": null,
      "InventoryNO": "QDDR-20220331-0005",
      "InventoryFullName": "(一)大渡河双线特大桥/Ⅰ.建筑工程费/1.基础/(2)承台/①混凝土/实木修整C2",
      "InventoryType": "2",
      "PID": "c49040d7-a542-4af7-9391-9ee48b91591b",
      "BiddingPlanDtlID": null,
      "BiddingPlanID": null,
      "BiddingPlanWFDtlID": null,
      "ParentCode": null
    }]
    this.setState({ data: arr});
  };

  scrollToItem = index => {
    if (this.actions) {
      this.actions.scrollToItem(index, 'center');
    }
  };

  expandTo = (depth = 1) => {
    this.actions.expandTo(depth);
  };

  expandAll = () => {
    this.actions.expandAll();
  };
  collapseAll = () => {
    this.actions.collapseAll();
  };

  rowKey = 'id';
  deleteRow = row => {
    let rowKey = this.rowKey;
    let key = row[rowKey];
    this.actions.deleteData([key]);
  };

  copiedRow = null;
  copy = row => {
    let rowData = {};

    for (const k in row) {
      if (row.hasOwnProperty(k) && k !== 'children') {
        rowData[k] = row[k];
      }
    }
    let str = JSON.stringify(rowData);
    this.copiedRow = JSON.stringify(rowData);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', str);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
    }
    document.body.removeChild(input);
  };

  pasteChildren = targetRow => {
    let rowKey = this.rowKey;

    let copiedRow = this.copiedRow;

    if (copiedRow) {
      let sourceRow = JSON.parse(copiedRow);
      sourceRow[rowKey] = 'copied_row_' + sourceRow[rowKey];

      this.actions.insertData({
        data: [sourceRow],
        parentKey: targetRow[rowKey],
        editing: true,
        scrollTo: false,
      });

      this.isCut = false;
      this.copiedRow = null;
    }
  };

  isCut = false;
  cut = row => {
    this.copy(row);
    this.isCut = true;
  };

  selectAll = rowData => {
    this.actions.selectToggle(rowData);
  };

  expandToggle = rowData => {
    this.actions.expandToggle(rowData);
  };

  onMenuClick = ({ key, item }) => {
    console.log('key:', item.props.row);

    let actions = {
      del: this.deleteRow,
      copy: this.copy,
      cut: this.cut,
      pasteChildren: this.pasteChildren,
      selectAll: this.selectAll,
      expandToggle: this.expandToggle,
      export: this.export,
    };

    let fn = actions[key];
    if (typeof fn === 'function') {
      fn(item.props.row);
    }
  };

  searchIndex = -1;
  searchedKey = '';
  onChangeSearch = () => {
    this.searchIndex = 0;
    this.searchedKey = '';
  };

  onSearch = v => {
    if (!v) {
      this.searchIndex = 0;
      this.searchedKey = '';
      this.scrollToItem(-1);
      this.forceUpdate();
      return;
    }

    //先展开所有以便查询定位
    this.expandAll();

    let searchedIndex = -1;
    let searchedKey = '';

    let f = this.actions.findData(d => d.name.indexOf(v) > -1, {
      startIndex: this.searchIndex,
      startRowKey: this.searchedKey,
      focused: true,
    });

    if (f) {
      searchedIndex = f.index;
      searchedKey = f.row.id;
    }

    if (searchedIndex > -1) {
      this.searchIndex = searchedIndex + 1;
      this.searchedKey = searchedKey;
    } else {
      this.searchIndex = -1;
      this.searchedKey = '';
    }
  };

  onFilter = v => {
    let { treeData } = this.state;
    if (!v) {
      this.setState({ treeData: treeData.slice() }, this.collapseAll);
      return;
    }

    this.actions.filterData(d => {
      return d.name.indexOf(v) > -1;
    });

    this.expandAll();
  };

  actions = {};
  componentDidMount() {
    console.log('actions:', this.actions);
    this.getData();
  }
  

  render() {
    return (
      <div style={{ height: '600px' }}>
        <Table
          shouldUpdate={true}
          orderNumber={true}
          allowSaveEmpty={true}
          alwaysValidate={true}
          columns={this.columns}
          rowKey="ContractDtlID"
          // defaultGroupedColumnKey={['LabourName']}
          defaultGroupedColumnKey={['InventoryFullName']}
          getGroupColumnValue={(row, dataIndex) => {
            if (dataIndex === "InventoryFullName") {
              if (!row.InventoryFullName) {
                return "";
              }
              return row.InventoryFullName.split('/').slice(0, -1).join('/');
            }
            return row[dataIndex];
          }}
          groupedColumnSummary={{
            data: [
              {
                title: '余量',
                dataIndex: 'InventorySurplusQty',
                type: 'sum',
              },
              {
                title: '数量',
                dataIndex: 'Qty',
                type: 'sum',
              },
              {
                title: '含税金额',
                dataIndex: 'RMoney',
                type: 'sum',
              },
              {
                title: '不含税金额',
                dataIndex: 'RNoTaxMoney',
                type: 'sum',
              },
              {
                title: '税额',
                dataIndex: 'RTaxMoney',
                type: 'sum',
              },
            ],
            render: (text, value, d, e) => {
              if (d.dataIndex === "InventorySurplusQty" || d.dataIndex === "Qty") {
                return d.title + ":" + Number(value || 0);
              } else {
                return d.title + ":" + Number(value || 0);
              }
            },
          }}
          selectMode="multiple"

          validateTrigger={"onChange"}
          editTools={[
            "edit",
            "add",
            "delete",

          ]}


          rowHeight={40}

          dataSource={this.state.data}

          showPageination={false}
          autoRowHeight={false}

          summary={{
            style: { border: 'none' },
            title: { text: '合计:', column: 'LabourCode' },
            data: [
              {
                'RMoney': 'sum',
                'RNoTaxMoney': 'sum',
                'RTaxMoney': 'sum',
              }],
            render: (value, dataIndex, type, index) => {
              if (dataIndex == "Qty" || dataIndex == "InventorySurplusQty") {
                return (value || 0);
              } else {
                return (value || 0);
              }
            },
          }}

        />
      </div>
    );
  }
}

export default Demo;
