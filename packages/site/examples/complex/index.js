import React, { Component } from "react";
import { Table, unflatten } from "tablex";
import { Button, Input } from "antd";
import _ from "lodash";

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
      dataIndex: "name",
      editor: (value, record, index) => {
        return <Input defaultValue={value} />;
      }
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
      width: 150
    },
    {
      dataIndex: "unitPrice",
      key: "unitPrice",
      title: "综合单价",
      width: 150
    },
    {
      dataIndex: "totalPrice",
      key: "totalPrice",
      title: "合价",
      width: 150
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
    expandedRowKeys: []
  };

  getData = () => {
    this.setState({ loading: false });

    let c = 0;
    requestGet("/public/data.json", {
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
              pid = "";
            } else {
              pid = id.substring(0, len - pl);
            }
          }

          d.pid = pid;
        });

        //data= data.splice(0,10000)
        //let bd = new Date();

        //  console.log("tree formatting :", data.length);
        let treeData = unflatten(data, "id", "pid");
        // console.log(
        //   "tree format finished :",
        //   (new Date().getTime() - bd.getTime()) / 1000
        // );

        // console.log("treeData:", treeData);
        console.log("c:", c);

        this.setState({ data: treeData, flatData: data, loading: false });
      }
    });
  };

  componentDidMount() {}

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

  render() {
    return (
      <Table
        rowKey="id"
        editable={true}
        ref="tb"
        loading={this.state.loading}
        expandedRowKeys={this.state.expandedRowKeys}
        columns={this.columns}
        selectMode="none"
        data={this.state.data}
        orderNumber={true}
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
          </div>
        )}
      />
    );
  }
}

export default Demo;
