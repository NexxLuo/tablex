import React from "react";
import Table from "../src/index";

class LazyLoad extends React.Component {
  state = {
    columns: [
      {
        title: "Name",
        dataIndex: "name",
        width: 200
      },
      {
        title: "Age",
        dataIndex: "age",
        width: 200
      },
      {
        title: "Address",
        children: [
          {
            title: "公司地址",
            dataIndex: "address1",
            width: 200
          },
          {
            title: "家庭地址",
            dataIndex: "address2",
            width: 200
          }
        ]
      }
    ],
    dataSource: []
  };

  componentDidMount() {
    let data = [];
    for (let i = 0; i < 46; i++) {
      data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address1: `London, Park Lane no. ${i}`,
        address2: `London, Park Lane no. ${i}`,
        address3: `London, Park Lane no. ${i}`,
        address4: `London, Park Lane no. ${i}`,
        children: []
      });
    }

    this.setState({ dataSource: data });
  }

  loadChildrenData = row => {
    if (row.children && row.children.length > 0) {
      return;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let childrens = [
          {
            key: "children_1",
            name: `Edward King children_1`,
            age: 32,
            address1: `London, Park Lane no. children_1`,
            address2: `London, Park Lane no. children_1`,
            address3: `London, Park Lane no. children_1`,
            address4: `London, Park Lane no. children_1`
          },
          {
            key: "children_2",
            name: `Edward King children_2`,
            age: 32,
            address1: `London, Park Lane no. children_2`,
            address2: `London, Park Lane no. children_2`,
            address3: `London, Park Lane no. children_2`,
            address4: `London, Park Lane no. children_2`
          }
        ];

        row.children = childrens;
        // this.forceUpdate();
        resolve(childrens);
      }, 1000);
    });
  };

  render() {
    let { dataSource, columns } = this.state;

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        loadChildrenData={this.loadChildrenData}
        rowKey="key"
      />
    );
  }
}

export default LazyLoad;
