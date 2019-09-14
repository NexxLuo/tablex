import React, { Component } from "react";
import { Table, unflatten, flatten } from "tablex";
import { Button, Input, Menu, InputNumber } from "antd";
import { find } from "./tree-data-utils";
import _ from "lodash";
import "./index.css";

const { Search } = Input;

let BaseUrl = process.env.DOCZ_BASE || "";

function requestGet(url, options) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () { };

  xhr.onload = function () {
    if (xhr.status == 200) {
      if (typeof options.onSuccess === "function") {
        var res = {};
        if (xhr.responseText) {
          res = JSON.parse(xhr.responseText);
        }
        options.onSuccess(res);
      }
    }
  };

  xhr.onerror = options.onError;

  xhr.send();
}

function createData(level, parentKey, maxLevel, index) {
  if (level > maxLevel) {
    return;
  }

  let l = level;
  let data = [];
  for (let i = 0; i < 5; i++) {
    let k = parentKey + "-" + level + "-" + i;
    let d = {
      id: k,
      name: "Edward King " + k,
      age: 32,
      address: "London, Park Lane no. " + i
    };

    if (i % 2 === 0) {
      d.children = createData(l + 1, k, maxLevel, i);
    }

    data.push(d);
  }
  return data;
}

function createTreeData() {
  let data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      id: "" + i,
      level: 0,
      name: "Edward King " + i,
      age: 32,
      address: "London, Park Lane no. " + i,
      children: createData(0, i, 4)
    });
  }

  return data;
}

class Demo extends Component {
  columns = [
    {
      dataIndex: "code",
      key: "code",
      title: "编码",
      width: 200
    },
    {
      title: "名称",
      width: 150,
      key: "name",
      dataIndex: "name"
    },
    {
      dataIndex: "description",
      key: "description",
      title: "特征描述",
      width: 150
    },
    {
      dataIndex: "unit",
      key: "unit",
      title: "单位",
      width: 150
    },
    {
      dataIndex: "quantities",
      key: "quantities",
      title: "工程量",
      width: 150,
      editor: (value, record, index, onchange, ref, validate) => {
        return (
          <Input
            defaultValue={value}
            ref={ref}
            onChange={v => {
              onchange({ quantities: v.target.value });
            }}
          />
        );
      }
    },
    {
      dataIndex: "unitPrice",
      key: "unitPrice",
      title: "综合单价",
      width: 150,
      editor: (value, record, index, onchange, ref, validate) => {
        return (
          <InputNumber
            defaultValue={value}
            ref={ref}
            onKeyDown={e => {
              e.stopPropagation();
            }}
            onChange={e => {
              onchange({ unitPrice: e });
            }}
          />
        );
      }
    },
    {
      dataIndex: "totalPrice",
      key: "totalPrice",
      title: "合价",
      width: 150,
      render: (value, row) => {
        let v = row.unitPrice * row.quantities;
        if (isNaN(v)) {
          return "";
        }
        return v;
      }
    },
    {
      dataIndex: "evaluation",
      key: "evaluation",
      title: "暂估价",
      width: 150
    }
  ];

  state = {
    loading: false,
    treeData: []
  };

  getData = () => {
    this.setState({ loading: true });

    let c = 0;
    requestGet(BaseUrl + "/public/data.json", {
      onSuccess: data => {
        data = _.uniqBy(data, d => {
          return d.code;
        });

        let bl = false;

        data.forEach(d => {
          let id = d.code || "";
          let pid = "";
          let len = id.length;
          d.id = id;

          if (len >= 2) {
            let pl = 2;

            if (len % 2 !== 0) {
              pl = 3;
            }

            if (id === "040704") {
              bl = true;
            }

            if (bl === true) {
              pid = "0407";
            } else {
              pid = id.substring(0, len - pl);
            }
          }

          d.pid = pid;
        });

        let treeData = unflatten(data, "id", "pid");

        this.setState({
          loading: false,
          treeData: treeData 
        });
      }
    });
  };


  scrollToItem = index => {
    if (this.refs.tb) {
      this.refs.tb.scrollToItem(index, "center");
    }
  };

  expandTo = (depth = 1) => {
    this.refs.tb.expandTo(depth);
  };

  expandAll = () => {
    this.refs.tb.expandAll();
  };
  collapseAll = () => {
    this.refs.tb.collapseAll();
  };


  rowKey = "id";
  deleteRow = row => {
    let rowKey = this.rowKey;
    let key = row[rowKey];
    this.refs.tb.api.deleteData([key]);
  };

  copiedRow = null;
  copy = row => {
    let rowData = {};

    for (const k in row) {
      if (row.hasOwnProperty(k) && k !== "children") {
        rowData[k] = row[k];
      }
    }
    let str = JSON.stringify(rowData);
    this.copiedRow = JSON.stringify(rowData);

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.setAttribute("value", str);
    input.select();
    if (document.execCommand("copy")) {
      document.execCommand("copy");
    }
    document.body.removeChild(input);
  };

  pasteChildren = targetRow => {
    let rowKey = this.rowKey;

    let copiedRow = this.copiedRow;

    if (copiedRow) {
      let sourceRow = JSON.parse(copiedRow);
      sourceRow[rowKey] = "copied_row_" + sourceRow[rowKey];

      this.refs.tb.api.insertData({
        data: [sourceRow],
        parentKey: targetRow[rowKey],
        editing: true,
        scrollTo: false
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
    this.refs.tb.selectToggle(rowData);
  };

  expandToggle = rowData => {
    this.refs.tb.expandToggle(rowData);
  };

  onMenuClick = ({ key, item }) => {
    console.log("key:", item.props.row);

    let actions = {
      del: this.deleteRow,
      copy: this.copy,
      cut: this.cut,
      pasteChildren: this.pasteChildren,
      selectAll: this.selectAll,
      expandToggle: this.expandToggle,
      export: this.export
    };

    let fn = actions[key];
    if (typeof fn === "function") {
      fn(item.props.row);
    }
  };

  searchIndex = -1;
  searchedKey = "";
  onChangeSearch = () => {
    this.searchIndex = 0;
    this.searchedKey = "";
  };

  onSearch = v => {
    if (!v) {
      this.searchIndex = 0;
      this.searchedKey = "";
      this.scrollToItem(-1);
      this.forceUpdate();
      return;
    }

    //先展开所有以便查询定位
    this.expandAll();

    let searchedIndex = -1;
    let searchedKey = "";

    let f = this.refs.tb.findData(d => d.name.indexOf(v) > -1, {
      startIndex: this.searchIndex,
      focused: true
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
      this.searchedKey = "";
    }
  };

  onFilter = v => {
    let { treeData } = this.state;
    if (!v) {
      this.setState({ treeData: treeData.slice() }, this.collapseAll);
      return;
    }

    this.refs.tb.filterData(d => {
      return d.name.indexOf(v) > -1;
    });

    this.expandAll();
  };

  contentMenu = row => {
    let menuItemProps = {
      style: { height: "auto", lineHeight: "normal" },
      row
    };

    return (
      <Menu selectable={false} onClick={this.onMenuClick}>
        <Menu.Item key="del" {...menuItemProps}>
          删除行
        </Menu.Item>
        <Menu.Item key="copy" {...menuItemProps}>
          复制行
        </Menu.Item>
        <Menu.Item key="cut" {...menuItemProps}>
          剪切行
        </Menu.Item>
        <Menu.Item key="pasteChildren" {...menuItemProps}>
          粘贴行(下级)
        </Menu.Item>
        <Menu.Item key="selectAll" {...menuItemProps}>
          全选/全否
        </Menu.Item>
        <Menu.Item key="expandToggle" {...menuItemProps}>
          展开/收缩
        </Menu.Item>
        <Menu.Item key="export" {...menuItemProps}>
          导出
        </Menu.Item>
        <Menu.Item key="print" {...menuItemProps}>
          打印
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    return (
      <div style={{ height: "100%" }}>
        <Table
          rowKey="id"
          editable={true}
          ref="tb"
          loading={this.state.loading}
          columns={this.columns}
          selectMode="multiple"
          checkStrictly={false}
          data={this.state.treeData}
          orderNumber={{ resizable: true }}
          contextMenu={this.contentMenu}
          validateTrigger="onChange"
          isAppend={true}
          header={() => (
            <div>
              <Button onClick={this.getData}>获取数据</Button>
              <Button onClick={this.expandAll} style={{ margin: "0 5px" }}>
                展开所有
              </Button>
              <Button
                onClick={() => this.expandTo(1)}
                style={{ margin: "0 5px" }}
              >
                展开至第二级
              </Button>

              <Button onClick={this.collapseAll}>折叠所有</Button>
              <Search
                style={{ float: "right", margin: "0 5px", width: "150px" }}
                placeholder="输入名称过滤"
                onSearch={this.onFilter}
              />
              <Search
                style={{ float: "right", margin: "0 5px", width: "150px" }}
                placeholder="输入名称查找"
                onSearch={this.onSearch}
                onChange={this.onChangeSearch}
              />
            </div>
          )}
        />
      </div>
    );
  }
}

export default Demo;
