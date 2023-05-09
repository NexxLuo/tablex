import React from 'react';
import Table from 'tablex';
import { Button,Input } from 'antd';

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
        validator2: v => {
          return { valid: !!v, message: '请输入' }
        },
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
    console.log('onEditSave changedRows:', changedRows)
    console.log('onEditSave newData:', newData)
    this.setState({
      data: newData,
    })
  }
  onEditCancel() {
    console.log('onEditCancel')
  }
  add() {
    if (this.refs.etable) {
      this.refs.etable.api.addRows([{}, {}, {}])
    }
  }
  render() {
    let { data, count } = this.state

    return (
      <div style={{ height: 400 }}> <Table
        ref="etable"
        columns={this.columns}
        dataSource={data}
        header={() => (
          <div>
            <Button onClick={this.add.bind(this)}>api.addRows</Button>
          </div>
        )}
        editable={true}
        defaultAddCount={5}
        editTools={['add', 'edit', 'delete']}
        onEditSave={this.onEditSave.bind(this)}
        onCancel={this.onEditCancel}
        isAppend={true}
        allowSaveEmpty={true}
        alwaysValidate={true}
        validateTrigger="onChange"
        rowKey="id"
      ></Table></div>
    )
  }
}
export default Demo;
