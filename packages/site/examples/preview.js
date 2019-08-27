import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox } from "antd";

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

fixedColumns =[
        {
            dataIndex: "NoName",
            key: "NoName",
            minWidth: 80,
            title: "序号名称"
        },
        {
            dataIndex: "DtlName",
            key: "DtlName",
            minWidth: 80,
            title: "设备名称"
        },
        {
            dataIndex: "Model",
            key: "Model",
            minWidth: 80,
            title: "设备规格"
        },
        {
            dataIndex: "Specifications",
            key: "Specifications",
            minWidth: 80,
            title: "设备型号"
        },
        {
            dataIndex: "SetingMode",
            key: "SetingMode",
            minWidth: 80,
            title: "配置方式"
        },
        {
            dataIndex: "Depreciationmargin",
            key: "Depreciationmargin",
            minWidth: 150,
            title: () => {
                return (
                    <div>
                        已明确的自有设备调入
                        <br />
                        本项目前已计折旧额度
                    </div>
                );
            }
        },
        {
            title: "租赁(或折旧)费用",
            key:"aaaa",
            children: [
                {
                    title: "使用期限",
                    key:"bbbbb",
                    children: [
                        {
                            dataIndex: "UseStartTime",
                            key: "UseStartTime",
                            minWidth: 80,

                            title: "开始时间"
                        },
                        {
                            dataIndex: "UseEndTime",
                            key: "UseEndTime",
                            minWidth: 80,

                            title: "结束时间"
                        },
                        {
                            dataIndex: "UseDurationM",
                            key: "UseDurationM",
                            minWidth: 80,
                            title: "使用时长"
                        }
                    ]
                },
                {
                    title: "租赁(或折旧)费用",
                    children: [
                        {
                            dataIndex: "LeasePrice",
                            key: "LeasePrice",
                            minWidth: 80,
                            title: "单价(元/台.月)"
                        },
                        {
                            dataIndex: "LeaseValency",
                            key: "LeaseValency",
                            minWidth: 80,
                            title: "合价(元)"
                        },
                        {
                            dataIndex: "Leaseavgindex", //租赁.单位分摊指标
                            key: "Leaseavgindex",
                            minWidth: 80,
                            title: "单位分摊指标"
                        }
                    ]
                }
            ]
        },
        {
            title: "燃料动力费",
            children: [
                {
                    title: "油费",
                    children: [
                        {
                            dataIndex: "Unituseoil",
                            key: "Unituseoil",
                            minWidth: 80,
                            title: "单位耗油量(kg)"
                        },
                        {
                            dataIndex: "DieseloilPrice",
                            key: "DieseloilPrice",
                            minWidth: 80,
                            title: "柴油单价(元/kg)"
                        },
                        {
                            dataIndex: "Unituseolifee",
                            key: "Unituseolifee",
                            minWidth: 80,
                            title: "单位耗油费"
                        }
                    ]
                },
                {
                    title: "电费",
                    children: [
                        {
                            dataIndex: "Unituseelectric",
                            key: "Unituseelectric",
                            minWidth: 80,
                            title: "单位耗电量(KW.H)"
                        },
                        {
                            dataIndex: "Electricityprice",
                            key: "Electricityprice",
                            minWidth: 80,
                            title: "电价(元/KW.H)"
                        },
                        {
                            dataIndex: "Unituseelectricfee",
                            key: "Unituseelectricfee",
                            minWidth: 80,
                            title: "单位耗电费"
                        }
                    ]
                }
            ]
        },
        {
            title: "人工费",
            children: [
                {
                    dataIndex: "PostName",
                    key: "PostName",
                    minWidth: 80,
                    title: "岗位"
                },
                {
                    dataIndex: "PersonNum",
                    key: "PersonNum",
                    minWidth: 80,
                    title: "人数"
                },
                {
                    dataIndex: "DutyLaborcost",
                    key: "DutyLaborcost",
                    minWidth: 80,
                    title: "责任工费(人.月)"
                },
                {
                    dataIndex: "Months",
                    key: "Months",
                    minWidth: 80,
                    title: "月数"
                },
                {
                    dataIndex: "Totallabourcosts",
                    key: "Totallabourcosts",
                    minWidth: 80,
                    title: "合计人工费"
                }
            ]
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
            editable={true}
            rowKey="id"
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
            rowHeight={(d, i) => {
              if (i % 2 === 0) {
                return 50;
              } else {
                return 30;
              }
            }}
            expandRowHeight={200}
            headerRowHeight={[30, 40, 80]}
            minHeight={500}
          />
        </div>
      </>
    );
  }
}

export default Demo;
