import React from 'react';
import Table from 'tablex';
import { Input,Button } from 'antd';


class Demo extends React.Component {
  generateData(columns, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map(function(row, rowIndex) {
      return columns.reduce(
        function(rowData, column, columnIndex) {
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
        align: 'center',
      },
      {
        dataIndex: 'column-1',
        key: 'column-1',
        title: 'column-1',
        validator: value => {
          if (!value) {
            return {
              valid: false,
            }
          } else {
            return {
              valid: true,
            }
          }
        },
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ 'column-1': e.target.value })}
            ></Input>
          )
        },
      },

      {
        dataIndex: 'column-2',
        key: 'column-2',
        title: 'column-2',
        width: 150,
        align: 'center',
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              defaultValue={value}
              ref={ref}
              onChange={e => onchange({ 'column-2': e.target.value })}
            ></Input>
          )
        },
      },

      {
        dataIndex: 'column-3',
        key: 'column-3',
        title: 'column-3',
        align: 'right',
      },
      {
        dataIndex: 'column-4',
        key: 'column-4',
        title: 'column-4',
        width: 100,
        align: 'center',
      },
    ]

    let data = this.generateData(columns, 10)

    this.state = {
      data: data,
      columns: columns,
      current: 1,
      pageSize: 10,
      total: data.length,
      selectedRowKeys: [],
    }
  }
  addData() {
    let arr = new Array(5).fill(0).map((d, i) => {
      return {
        id: 'addedData-' + i + '-' + new Date().getTime(),
        'column-1': i === 0 ? '' : 'value-' + i,
        'column-2': i === 0 ? '' : 'value2-' + i,
        'column-3': 'value3-' + i,
      }
    })
    this.refs.tb.api.addRows(arr, true, false)
  }
  onEditSave(changedRows, newRows, type) {
    this.setState({ data: newRows })
    console.log('onEditSave')
  }
  render() {
    let { columns, data } = this.state
    return (
      <div style={{ height: 400 }}>
        <Table
          rowKey="id"
          ref="tb"
          editable={true}
          columns={columns}
          selectMode="multiple"
          loading={false}
          data={data}
          onEditSave={this.onEditSave.bind(this)}
          ignoreEmptyRow={true}
          isAppend={true}
          validateTrigger="onChange"
          editTools={[
            'edit',
            'add',
            'delete',
            function() {
              return (
                <Button onClick={this.addData.bind(this)}>新增数据</Button>
              )
            }.bind(this),
          ]}
        />
      </div>
    )
  }
}

export default Demo;
