import React from 'react';
import Table from 'tablex';

import { Input,InputNumber,DatePicker,Switch,Select } from 'antd';


class Demo extends React.Component {
  generateData(columns, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          if (column.dataIndex !== 'id') {
            rowData[column.dataIndex] = Math.floor(Math.random() * 100 + 1)
          } else {
            rowData[column.dataIndex] =
              prefix + ' ' + rowIndex + ' - Col ' + columnIndex
          }
          return rowData
        },
        {
          id: prefix + rowIndex,
          parentId: null,
        },
      )
    })
  }
  constructor(props) {
    super(props)
    const columns = [
      {
        dataIndex: 'id',
        title: 'id',
        key: 'id',
        width: 150,
      },
      {
        dataIndex: 'column-1',
        title: 'column-1',
        width: 100,
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: '请输入' }
          }

          return { valid: true, message: 'false' }
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ ['column-1']: e.target.value })}
            />
          )
        },
      },

      {
        dataIndex: 'column-2',
        title: 'column-2',
        width: 150,
        align: 'center',
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: '请输入' }
          }

          return { valid: true, message: 'false' }
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <InputNumber
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ ['column-2']: e })}
            />
          )
        },
      },

      {
        dataIndex: 'column-3',
        title: 'column-3',
        align: 'right',
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: '请输入' }
          }

          return { valid: true, message: 'false' }
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <Select
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ ['column-3']: e })}
            />
          )
        },
      },
      {
        dataIndex: 'column-4',
        title: 'column-4',
        width: 100,
        align: 'center',
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: '请输入' }
          }

          return { valid: true, message: 'false' }
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <DatePicker
              placeholder=""
              ref={ref}
              onChange={e => onchange({ ['column-4']: e })}
            />
          )
        },
      },
      {
        dataIndex: 'column-5',
        title: 'column-5',
        width: 100,
        align: 'center',
        validator: function(value, row) {
          if (!value) {
            return { valid: false, message: '请输入' }
          }

          return { valid: true, message: 'false' }
        },
        editor: function(value, row, index, onchange, ref) {
          return (
            <Switch
              ref={ref}
              onChange={e => onchange({ ['column-5']: e.target.value })}
            />
          )
        },
      },
    ]

    let data = this.generateData(columns, 10)

    data[1].children = this.generateData(columns, 3, 'children-')

    this.state = {
      data: data,
      columns: columns,
    }
  }
  onEditSave(changedRows, newData, type) {
    console.log('onEditSave:', newData)
    this.setState({
      data: newData,
    })
  }
  componentDidMount() {
    //this.refs.tableRef.api.edit()
  }
  render() {
    let { columns, data } = this.state
    return (
      <div style={{ height: 400 }}><Table
        rowKey="id"
        ref="tableRef"
        columns={columns}
        validateTrigger="onChange"
        data={data}
        editorNoBorder={true}
        editable={true}
        selectMode={'multiple'}
        checkStrictly={false}
        editAll={true}
        editTools={['edit', 'add', 'delete']}
        onEditSave={this.onEditSave.bind(this)}
      /></div>
    )
  }
}

export default Demo;
