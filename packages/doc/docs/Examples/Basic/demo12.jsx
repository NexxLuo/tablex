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
        },
      ]

      let data = this.generateData(columns, 20)

      data[0].children = this.generateData(columns, 5, 'Row-0-children-')
      data[0].children[0].children = this.generateData(
        columns,
        5,
        'Row-0-children-0-',
      )

      data[3].children = this.generateData(columns, 5, 'Row-3-children-')
      data[3].children[0].children = this.generateData(
        columns,
        5,
        'Row-3-children-0-',
      )

      this.state = {
        data: data,
        columns: columns,
      }
    }
    render() {
      let { columns, data } = this.state
      return (
        <div style={{ height: 400 }}><Table
          rowKey="id"
          columns={columns}
          data={data}
          indentSize={30}
          selectMode="none"
          orderNumber={false}
          checkStrictly={false}
          showHeader={false}
          bordered={false}
          striped={false}
          hoverable={false}
        /></div>
      )
    }
  }

export default Demo;
