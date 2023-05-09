import React from 'react';
import Table from 'tablex';

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
        key: 'column-1',
        title: 'column-1',
        width: 100,
      },

      {
        dataIndex: 'column-2',
        key: 'column-2',
        title: 'column-2',
        width: 150,
        align: 'center',
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

    let data = this.generateData(columns, 50)

    data[3].children = []
    data[4].children = []

    this.state = {
      data: data,
      columns: columns,
    }
  }
  loadChildrenData(row) {
    if (row.children && row.children.length > 0) {
      return
    }

    return new Promise(resolve => {
      setTimeout(() => {
        let arr = this.generateData(
          this.state.columns,
          5,
          (prefix = row.id + '-children-'),
        )
        arr[0].children = []
        resolve(arr)
      }, 500)
    })
  }
  render() {
    let { columns, data } = this.state
    return (
      <div style={{ height: 400 }}><Table
        rowKey="id"
        columns={columns}
        data={data}
        selectMode="multiple"
        orderNumber={true}
        loadChildrenData={this.loadChildrenData.bind(this)}
      /></div>
    )
  }
}

export default Demo;
