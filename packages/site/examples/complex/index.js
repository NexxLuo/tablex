import React, { Component } from "react";
import { Table, unflatten, flatten } from "tablex";
import { Button, Input, Menu, InputNumber } from "antd";
import _ from "lodash";
import "./index.css";

const { Search } = Input;

function requestGet(url, options) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function() {};

  xhr.onload = function() {
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
          <Input
            defaultValue={value}
            ref={ref}
            onChange={e => {
              onchange({ unitPrice: e.target.value });
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
    data: [],
    expandedRowKeys: [],
    selectedRowKeys: []
  };

  getData = () => {
    this.setState({ loading: true });

    let c = 0;
    requestGet("/public/data.json", {
      onSuccess: data => {
        this.setState({ loading: false });

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

        this.setTreeData(data);
      }
    });
  };

  componentDidMount() {}

  scrollToItem = index => {
    if (this.refs.tb) {
      this.refs.tb.scrollToItem(index, "center");
    }
  };

  expandTo = (depth = 2) => {
    let keys = [];

    let pl = 2;

    this.state.flatData.forEach(d => {
      let len = d.id.length;
      if (len <= depth * pl) {
        keys.push(d.id);
      }
    });

    this.setState({ expandedRowKeys: keys });
  };

  expandAll = () => {
    let keys = this.state.flatData.map(d => {
      return d.id;
    });

    this.setState({ expandedRowKeys: keys });
  };
  collapseAll = () => {
    this.setState({ expandedRowKeys: [] });
  };

  contentMenuRow = null;
  showContextMenu = ({ left, top, data }) => {
    this.contentMenuRow = data;
    let el = document.getElementById("contextMenu");
    if (el) {
      el.style.top = top + "px";
      el.style.left = left + "px";
      el.style.display = "block";
      el.focus();
    }
  };

  hideContextMenu = () => {
    this.contentMenuRow = null;
    let el = document.getElementById("contextMenu");
    if (el) {
      el.style.display = "none";
    }
  };

  onRow = row => {
    return {
      onContextMenu: e => {
        e.preventDefault();
        e.stopPropagation();
        this.showContextMenu({ left: e.pageX, top: e.pageY, data: row });
      }
    };
  };

  setTreeData = data => {
    let bd = new Date();
    console.log("tree data flattening :", data.length);
    let treeData = unflatten(data, "id", "pid");
    console.log(
      "tree data flatten finished :",
      (new Date().getTime() - bd.getTime()) / 1000
    );
    this.setState({ data: treeData, flatData: data, loading: false });
  };

  rowKey = "id";
  deleteRow = row => {
    let rowKey = this.rowKey;
    let key = row[rowKey];
    let { flatData } = this.state;

    let i = flatData.findIndex(d => d[rowKey] === key);
    if (i > -1) {
      flatData.splice(i, 1);
    }
    this.setTreeData(flatData);
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

      let { list, roots } = flatten([sourceRow]);

      let sourceRowList = [];

      for (let i = 0; i < list.length; i++) {
        let d = Object.assign({}, list[i]);
        if (this.isCut !== true) {
          d[rowKey] = d[rowKey] + "_copiedRow";
          d["pid"] = targetRow[rowKey];
        }
        sourceRowList.push(d);
      }

      let { flatData } = this.state;

      if (this.isCut === true) {
        let i = flatData.findIndex(d => d[rowKey] === sourceRow[rowKey]);
        if (i > -1) {
          flatData.splice(i, 1);
        }
      }

      flatData = flatData.concat(sourceRowList);

      this.isCut = false;
      this.copiedRow = null;
      this.setTreeData(flatData);
    }
  };

  isCut = false;
  cut = row => {
    this.copy(row);
    this.isCut = true;
  };

  toggleSelectOrExpand = (rowData, type = 0) => {
    let stateName = ["expandedRowKeys", "selectedRowKeys"][type];

    let bd = new Date();
    console.log("toggleSelectOrExpand " + stateName + " :");

    let rowKey = this.rowKey;
    let key = rowData[rowKey];
    let keys = this.state[stateName];

    let nextKeys = [];

    let keysMap = {};

    for (let i = 0; i < keys.length; i++) {
      keysMap[keys[i]] = true;
    }

    let { list } = flatten([rowData]);

    let isExist = keysMap[key] === true;

    for (let i = 0; i < list.length; i++) {
      const k = list[i][rowKey];

      if (isExist) {
        keysMap[k] = false;
      } else {
        if (keysMap[k] !== true) {
          keysMap[k] = true;
        }
      }
    }

    for (const d in keysMap) {
      if (keysMap[d] === true) {
        nextKeys.push(d);
      }
    }

    console.log(
      "toggleSelectOrExpand " + stateName + ":",
      (new Date().getTime() - bd.getTime()) / 1000
    );

    this.setState({ [stateName]: nextKeys });
  };

  selectAll = rowData => {
    this.toggleSelectOrExpand(rowData, 1);
  };

  expandToggle = rowData => {
    this.toggleSelectOrExpand(rowData, 0);
  };

  onMenuClick = ({ key }) => {
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
      fn(this.contentMenuRow);
    }
  };

  searchIndex = -1;
  searchedKey = "";
  onChangeSearch = () => {
    this.searchIndex = 0;
    this.searchedKey = "";
  };

  onSearch = v => {
    let { flatData } = this.state;

    if (!v) {
      this.searchIndex = 0;
      this.searchedKey = "";
      this.forceUpdate();
      return;
    }

    //先展开所有以便查询定位
    this.expandAll();

    let searchedIndex = -1;
    let searchedKey = "";

    for (let i = this.searchIndex + 1, len = flatData.length; i < len; i++) {
      let name = flatData[i].name;

      if (name.indexOf(v) > -1) {
        searchedIndex = i;
        searchedKey = flatData[i].id;
        break;
      }
    }

    if (searchedIndex > -1) {
      this.scrollToItem(searchedIndex);
      this.searchIndex = searchedIndex + 1;
      this.searchedKey = searchedKey;
    } else {
      this.searchIndex = -1;
      this.searchedKey = "";
    }
  };

  rowClassName = (row, index) => {
    if (row.id === this.searchedKey) {
      return "row-searched";
    }

    return "";
  };

  render() {
    let menuItemStyle = { height: "auto", lineHeight: "normal" };

    return (
      <div style={{ height: "100%" }}>
        <Table
          rowKey="id"
          editable={true}
          ref="tb"
          loading={this.state.loading}
          rowClassName={this.rowClassName}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpandedRowsChange={keys => {
            this.setState({ expandedRowKeys: keys });
          }}
          selectedRowKeys={this.state.selectedRowKeys}
          onSelectChange={keys => {
            this.setState({ selectedRowKeys: keys });
          }}
          columns={this.columns}
          selectMode="multiple"
          checkStrictly={false}
          data={this.state.data}
          orderNumber={true}
          onRow={this.onRow}
          validateTrigger="onChange"
          header={() => (
            <div style={{ padding: "10px 0" }}>
              <Button onClick={this.getData}>get data</Button>
              <Button onClick={this.expandAll} style={{ margin: "0 5px" }}>
                expand all
              </Button>
              <Button
                onClick={() => this.expandTo(2)}
                style={{ margin: "0 5px" }}
              >
                expand to 2
              </Button>

              <Button onClick={this.collapseAll}>collapse all</Button>

              <Search
                style={{ float: "right", margin: "0 5px", width: "200px" }}
                placeholder="输入名称查找"
                onSearch={this.onSearch}
                onChange={this.onChangeSearch}
              />
            </div>
          )}
        />
        <Menu
          style={{
            display: "none",
            position: "fixed",
            border: "1px solid #ccc",
            boxShadow: "2px 2px 5px 2px rgba(0, 0, 0, 0.15)"
          }}
          tabIndex="1"
          id="contextMenu"
          onBlur={this.hideContextMenu}
          onClick={this.onMenuClick}
          selectable={false}
        >
          <Menu.Item key="del" style={menuItemStyle}>
            删除行
          </Menu.Item>
          <Menu.Item key="copy" style={menuItemStyle}>
            复制行
          </Menu.Item>
          <Menu.Item key="cut" style={menuItemStyle}>
            剪切行
          </Menu.Item>
          <Menu.Item key="pasteChildren" style={menuItemStyle}>
            粘贴行(下级)
          </Menu.Item>
          <Menu.Item key="selectAll" style={menuItemStyle}>
            全选/全否
          </Menu.Item>
          <Menu.Item key="expandToggle" style={menuItemStyle}>
            展开/收缩
          </Menu.Item>
          <Menu.Item key="export" style={menuItemStyle}>
            导出
          </Menu.Item>
          <Menu.Item key="print" style={menuItemStyle}>
            打印
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default Demo;
