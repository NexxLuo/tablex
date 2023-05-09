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
        align: 'center',
      },
      {
        key: 'column-group-1',
        title: 'column group',

        children: [
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
            width: 100,
            children: [
              {
                dataIndex: 'column-3',
                key: 'column-3',
                title: 'column-3',
                width: 100,
              },
              {
                dataIndex: 'column-4',
                key: 'column-4',
                title: 'column-4',
                width: 100,
              },
            ],
          },
        ],
      },

      {
        dataIndex: 'column-5',
        key: 'column-5',
        title: 'rowSpan',
        width: 150,
        align: 'center',
        rowSpan: 2,
        children: [
          {
            dataIndex: 'column-5-1',
            key: 'column-5-1',
            title: 'column-5-1',
            width: 150,
            children: [
              {
                dataIndex: 'column-5-1-1',
                key: 'column-5-1-1',
                title: 'column-5-1-1',
                width: 150,
              },
            ],
          },
        ],
      },
      {
        dataIndex: 'column-6',
        key: 'column-6',
        title: 'column-6',
        align: 'center',
        children: [
          {
            dataIndex: 'column-6-1',
            key: 'column-6-1',
            title: 'colSpan',
            colSpan: 2,
            width: 100,
          },
          {
            dataIndex: 'column-6-2',
            key: 'column-6-2',
            title: 'column-6-2',
            width: 100,
          },
        ],
      },
    ]

    let data = this.generateData(columns, 20)

    this.state = {
      data: data,
      columns: columns,
    }
  }
  render() {
    let { columns, data } = this.state
    return (
      <div style={{ height: 400 }}><Table rowKey="id" columns={columns} data={data} orderNumber={true} /></div>
    )
  }
}

export default Demo;
