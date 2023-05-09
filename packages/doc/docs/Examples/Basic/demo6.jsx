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
          titleRender: function() {
            return <span style={{ color: '#ccc' }}>titleRender</span>
          },
        },
        {
          dataIndex: 'column-5',
          key: 'column-5',
          title: 'column-5',
          width: 100,
          align: 'center',
        },
        {
          dataIndex: 'column-6',
          key: 'column-6',
          title: 'column-6',
          align: 'center',
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
        <Table rowKey="id" columns={columns} data={data} orderNumber={true} />
      )
    }
  }

export default Demo;
