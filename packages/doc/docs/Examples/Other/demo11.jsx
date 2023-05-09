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
    let data = this.generateData([], 50)

    this.state = {
      data: data,
    }
  }
  getColumns() {
    let columns = [
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
        width: 300,
        render: (v, r, i) => {
          let strArr = new Array(10 + i * 10)
            .fill('auto row height')
            .join(';')

          return <div>{strArr}</div>
        },
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

    return columns
  }
  render() {
    let { data } = this.state
    let columns = this.getColumns()
    return (
      <div style={{ height: 400 }}><Table
        rowKey="id"
        columns={columns}
        data={data}
        selectMode="multiple"
        autoRowHeight={true}
        orderNumber={true}
      /></div>
    )
  }
}

export default Demo;
