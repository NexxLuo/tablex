import React from 'react';
import Table from 'tablex';
import { Input,Button } from 'antd';

class Demo extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
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
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: '' }
          }

          return { valid: true, message: '' }
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              value={value}
              ref={ref}
              onChange={e => {
                let newValue = e.target.value

                row.name = newValue

                this.setState(
                  {
                    count: newValue,
                  },
                  () => {
                    onchange({ name: newValue, remark: '我是' + newValue })
                  },
                )
              }}
            ></Input>
          )
        },
      },
      {
        dataIndex: 'age',
        title: '年龄',
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
        validator: (value, row) => {
          if (!value) {
            return { valid: false, message: '' }
          }

          return { valid: true, message: '' }
        },
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
  onChange(e) {
    let value = e.target.value

    let { data, count } = this.state

    let newData = [...data]

    newData.forEach(d => {
      d.name = value
    })

    this.setState({
      count: value,
      data: newData,
    })
  }

  onEditSave(changedRows, newData, type) {
    this.setState({
      data: newData,
    })
  }

  complete() {
    this.refs['etable'].completeEdit()
  }

  render() {
    let { data, count } = this.state

    return (
      <div>
        <Input
          value={count}
          onChange={this.onChange.bind(this)}
          style={{ margin: '10px 0' }}
        ></Input>
        <Button
          onClick={this.complete.bind(this)}
          style={{ margin: '10px 0' }}
        >
          完成
        </Button>
        <div style={{ height: 400 }}>
          <Table
            ref="etable"
            columns={this.columns}
            dataSource={data}
            editable={true}
            defaultAddCount={1}
            onEditSave={this.onEditSave.bind(this)}
            isAppend={true}
            alwaysValidate={true}
            validateTrigger="onChange"
            rowKey="id"
          ></Table>
        </div>
      </div>
    )
  }
}
  
export default Demo;
