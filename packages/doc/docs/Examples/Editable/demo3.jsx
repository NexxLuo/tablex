import React from 'react';
import Table from 'tablex';

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
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: '' }
          }
          return { valid: true, message: '' }
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => {
                let newValue = e.target.value
                onchange({ number: newValue })
              }}
            ></Input>
          )
        },
      },
      {
        width: 150,
        dataIndex: 'name',
        title: '姓名',
        width: 150,
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: '' }
          }

          return { valid: true, message: '' }
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => {
                let newValue = e.target.value
                onchange({ name: newValue })
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

  render() {
    let { data, count } = this.state

    return (
      <div style={{ height: 400 }}><Table
        editTools={['edit', 'add', 'delete']}
        ref="etable"
        columns={this.columns}
        dataSource={data}
        defaultAddCount={1}
        onEditSave={this.onEditSave.bind(this)}
        isAppend={true}
        alwaysValidate={true}
        validateTrigger="onChange"
        readOnly={true}
        selectMode="multiple"
        rowKey="id"
      ></Table></div>
    )
  }
}

export default Demo;
