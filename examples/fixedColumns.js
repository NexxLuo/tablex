import React from "react";
import Table from "../src/index";

class LazyLoad extends React.Component {
  state = {
    columns: [
      {
        title: "Name",
        dataIndex: "name",
        width: 200,
        fixed: "left"
      },
      {
        title: "Age",
        dataIndex: "age",
        width: 400
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
      },
      {
        title: "Age2",
        dataIndex: "age2",
        width: 100,
        fixed: "right"
      }
    ],
    dataSource: []
  };

  componentDidMount() {
    let data = [];
    for (let i = 0; i < 200; i++) {
      data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address1: `London, Park Lane no. ${i}`,
        address2: `London, Park Lane no. ${i}`,
        address3: `London, Park Lane no. ${i}`,
        address4: `London, Park Lane no. ${i}`
      });
    }

    this.setState({ dataSource: data });
  }

  render() {
    let { dataSource, columns } = this.state;

    return <Table columns={columns} dataSource={dataSource} rowKey="key" />;
  }
}

export default LazyLoad;
