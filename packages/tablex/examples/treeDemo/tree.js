import React from "react";
import { message, Layout, Spin, Icon, Input, Button, Tooltip } from "antd";
import { Table as VirtualizedTable } from "../../src";
import { getCatalogTree } from "./service";
import { TreeItem } from "./tree.widget";

const InputGroup = Input.Group;
const { Header, Content } = Layout;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      selKey: "",
      treeData: []
    };
  }

  //map func
  dataMap = i => {
    return {
      ...i,
      title: i.CatalogName,
      key: i.CatalogID,
      children: i.IsLowest ? null : []
    };
  };

  columns = [
    {
      dataIndex: "title",
      title: "物资",
      render: (value, row, index) => {
        let icon;
        if (row.IsLowest) {
          icon = <Icon type="file" theme="twoTone" />;
        } else {
          icon = <Icon type="folder" theme="twoTone" />;
        }
        return (
          <>
            <TreeItem
              sel={row.key === this.state.selKey}
              onClick={this.onItemClick(row)}
            >
              {icon}&nbsp;{value + " " + row.Model}
            </TreeItem>
          </>
        );
      }
    }
  ];

  componentDidMount() {
    const params = this.getParams();
    //init data
    this.getData(params).then(data => {
      //设置treeData
      this.setTreeData(data.map(this.dataMap));
    });
  }

  //请求参数 func
  getParams = () => {
    const params = {
      pId: "",
      typeId: "1", //劳务目录 维持原有风格
      searchLeaf: false,
      orgId: "B391DFDC-0C61-483E-838B-7F756C8155E4", //来自全局 项目部ID
      CatalogName: this.CatalogName || "",
      CatalogModel: this.CatalogModel || "",
      IsEnableOnly: false,
      node: 1 //未知
    };
    return params;
  };

  //设置树数据 func
  setTreeData = d => {
    this.setState({ treeData: d });
  };

  //获取树数据公共 func
  getData = params =>
    new Promise((resolve, reject) => {
      getCatalogTree(params)
        .then(({ data, state }) => {
          if (state) {
            resolve(data);
          } else {
            message.error("获取物资失败！");
            reject();
          }
        })
        .catch(err => {
          message.error("获取物资失败！");
          reject();
        });
    });

  //异步加载数据子节点数据 func
  loadChildrenData = record => {
    return new Promise((resolve, reject) => {
      if (record.children.length > 0) {
        resolve();
        return;
      }
      const params = this.getParams();
      params.pId = record.key;

      this.getData(params).then(data => {
        const childrens = data.map(this.dataMap);
        record.children = childrens;

  
        //重新生成数据源，以便Table组件识别并更新
       this.setTreeData([...this.state.treeData]);
        resolve();
      });
    });
  };

  //查询 event
  onSearch = value => {
    const params = this.getParams();

    this.getData(params).then(data => {
      const treeData = data.map(this.dataMap);

      this.setTreeData(treeData);
    });
  };

  //树节点 event
  onItemClick = rowData => {
    return event => {
      const { onSelect } = this.props;
      this.setState({ selKey: rowData.key });
 

      //onSelect(rowData);
      // event.stopPropagation();
      // event.nativeEvent.stopImmediatePropagation();
    };
  };

  render() {
    const { treeData } = this.state;
  
    return (
      <>
        <Layout style={{ height: "100%" }}>
          <Header style={{ padding: 0, backgroundColor: "#ffffff" }}>
            <InputGroup compact>
              <Tooltip placement="top" title={"名称"}>
                <Input
                  style={{ width: "45%" }}
                  placeholder="名称"
                  onChange={e => (this.CatalogName = e.target.value)}
                />
              </Tooltip>
              <Tooltip placement="top" title={"型号"}>
                <Input
                  style={{ width: "45%" }}
                  placeholder="型号"
                  onChange={e => (this.CatalogModel = e.target.value)}
                />
              </Tooltip>
              <Button
                type="primary"
                shape="circle"
                icon="search"
                onClick={this.onSearch}
              />
            </InputGroup>
          </Header>
          <Content style={{ overflow: "hidden", height: "100%" }}>
            <VirtualizedTable
              showHeader={false}
              bordered={false}
              striped={false}
              hoverable={false}
              rowHeight={30}
              orderNumber={false}
              expandColumnKey="title"
              rowKey="key"
              data={treeData}
              columns={this.columns}
              loadChildrenData={this.loadChildrenData}
              onSelectChange={keys => {
                this.setState({ selKey: keys[0] });
              }}
              rowSelectClassName=""
            />
          </Content>
        </Layout>
      </>
    );
  }
}

export default Index;
