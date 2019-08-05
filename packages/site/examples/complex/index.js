import React, { Component } from "react";
import { Table, flatten } from "tablex";
import { Button } from "antd";
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

function getTreeFromFlatData({
  flatData,
  getKey = node => node.id,
  getParentKey = node => node.pid,
  rootKey = ""
}) {
  if (!flatData) {
    return [];
  }

  const childrenToParents = {};
  flatData.forEach(child => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = parent => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map(child => trav(child))
      };
    }

    return { ...parent };
  };

  return childrenToParents[rootKey].map(child => trav(child));
}



function createData(level, parentKey, maxLevel, index) {
  if (level > maxLevel) {
    return;
  }

  let l = level;
  let data = [];
  for (let i = 0; i < 10; i++) {
    let k = parentKey + "-" + level + "-" + i;
    let d = {
      id: k,
      "name": "Edward King " + k,
      age: 32,
      address: "London, Park Lane no. " + i
    };

    if (i % 2===0) {
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
      "name": "Edward King " + i,
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
    data: []
  };

  getData = () => {
    this.setState({ loading: false,data: createTreeData() });


   

    return;

    requestGet("/public/data.json", {
      onSuccess: data => {
        data = _.uniqBy(data, d => {
          return d.code;
        });

        data.forEach(d => {
          let id = d.code || "";
          let pid = "";
          let len = id.length;

          if (len > 2) {
            pid = id.substring(0, len - 2);
          }

          d.id = id;
          d.pid = pid;
        });

        //data= data.splice(0,10000)
        //console.log("data:", data);

        //  let treeData=unflatten(data,"id","pid");

        let treeData = getTreeFromFlatData({ flatData: data });

        let bd = new Date();
        //console.log("tree formatting :");

        let flatData = flatten(treeData);

        // console.log(
        //   "tree format finished :",
        //   (new Date().getTime() - bd.getTime()) / 1000
        // );

        // console.log("treeData:", treeData);

        this.setState({ data: treeData, loading: false });
      }
    });
  };

  componentDidMount() {}

  render() {
    return (
      <Table
        rowKey="id"
        editable={true}
        loading={this.state.loading}
        columns={this.columns}
        selectMode="none"
        data={this.state.data}
        orderNumber={true}
        header={() => (
          <div style={{ padding: "10px 0" }}>
            <Button onClick={this.getData}>get data</Button>
          </div>
        )}
      />
    );
  }
}

export default Demo;
