import React from 'react';
import Table from 'tablex';
import { Input,Button } from 'antd';


class Demo extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      data: [
        {
          id: '1',
          name: '张三',
          age: 20,
          idcard: '512878211145551112',
          remark: '我是张三',
        },
        {
          id: '2',
          name: '李四',
          age: 20,
          idcard: '512878211145551112',
          remark: '我是李四',
        },
      ],
    }

    this.columns = [
      {
        dataIndex: 'id',
        title: '编号',
        width: 200,
      },
      {
        dataIndex: 'name',
        title: '姓名',
        width: 150,
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => {
                let newValue = e.target.value
                onchange({ name: newValue, remark: '我是' + newValue })
              }}
            ></Input>
          )
        },
      },
      {
        dataIndex: 'age',
        title: '年龄',
        width: 150,

        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e =>
                onchange({ age: e.target.value, idcard: e.target.value })
              }
            ></Input>
          )
        },
      },
      {
        dataIndex: 'idcard',
        title: '身份证',
        width: 150,

        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              value={value}
              ref={ref}
              onChange={e => onchange({ idcard: e.target.value })}
            ></Input>
          )
        },
      },
      {
        dataIndex: 'tel',
        title: '电话号码',
        width: 150,

        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ tel: e.target.value })}
            ></Input>
          )
        },
      },
      {
        dataIndex: 'remark',
        title: '备注',
        editor: (value, row, index, onchange, ref) => {
          return <Input value={value} ref={ref} disabled={true}></Input>
        },
      },
    ]
  }
  onEditSave(changedRows, newData, type) {
    this.setState({
      data: newData,
    })
  }

  customTools() {
    return <Button>tools传递函数</Button>
  }

  render() {
    let { data, count } = this.state

    let tools = [
      'add',
      'edit',
      'delete',
      {
        icon: 'message',
        text: '查看消息',
        handler: () => {
          alert('点击了自定义按钮')
        },
      },
      this.customTools,
    ]

    return (
      <div style={{ height: 400 }}><Table
        ref="etable"
        columns={this.columns}
        dataSource={data}
        editable={true}
        defaultAddCount={1}
        onEditSave={this.onEditSave.bind(this)}
        isAppend={true}
        alwaysValidate={true}
        validateTrigger="onChange"
        editTools={tools}
        editToolsConfig={{
          position: 'top',
          editText: '自定义编辑按钮及图标',
          editIcon: 'message',
        }}
        rowKey="id"
      ></Table></div>
    )
  }
}

export default Demo;
