import React from "react";

import { Button, Input, Image, Popover } from "antd";
import { Table } from "../src/index";

class Demo extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: [
        {
          id: "1",
          name: undefined,
          age: 20,
          idcard: "512878211145551112",
          remark: "我是张三"
        },
        {
          id: "2",
          name: "李四",
          age: 20,
          idcard: "512878211145551112",
          remark: "我是李四"
        }
      ]
    };

    this.columns = [
      {
        dataIndex: "id",
        title: "编号",
        key: "id",

        width: 200
      },
      {
        dataIndex: "name",
        key: "name",

        title: "姓名",
        width: 150,
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: "" };
          }

          return { valid: true, message: "" };
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => {
                let newValue = e.target.value;
                onchange({
                  name: newValue,
                  remark: "我是" + newValue
                });
              }}
            />
          );
        }
      },
      {
        dataIndex: "age",
        title: "年龄",
        key: "age",

        width: 150,
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: "" };
          }

          return { valid: true, message: "" };
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e =>
                onchange({
                  age: e.target.value,
                  idcard: e.target.value
                })
              }
            />
          );
        }
      },
      {
        dataIndex: "idcard",
        key: "idcard",

        title: "身份证",
        width: 150,
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: "" };
          }

          return { valid: true, message: "" };
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              value={value}
              ref={ref}
              onChange={e => onchange({ idcard: e.target.value })}
            />
          );
        }
      },
      {
        dataIndex: "tel",
        key: "tel",
        title: "电话号码",
        width: 150,

        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: "" };
          }

          return { valid: true, message: "" };
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ tel: e.target.value })}
            />
          );
        }
      },
      {
        dataIndex: "remark",
        key: "remark",
        title: "备注",
        width: 200,
        editor: (value, row, index, onchange, ref) => {
          return <Input value={value} ref={ref} disabled={true} />;
        }
      }
    ];
  }

  onEditSave(changedRows, newData, type) {
    console.log("onEditSave:", newData);
    this.setState({
      data: newData
    });
  }

  componentDidMount() {
    // console.log("a:",this.refs.etable);
  }

  render() {
    let { data, count } = this.state;

    return (
      <Table
        editable={true}
        editToolsConfig={{ position: "top" }}
        editTools={["edit", "add", "delete"]}
        columns={this.columns}
        dataSource={data}
        defaultAddCount={1}
        onEditSave={this.onEditSave.bind(this)}
        isAppend={true}
        alwaysValidate={false}
        validateTrigger="onChange"
        rowKey="id"
      />
    );
  }
}

export default Demo;
