import React from 'react';
import Table from 'tablex';

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          rowData[column.dataIndex] =
            prefix + ' ' + rowIndex + ' - Col ' + columnIndex
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
        dataIndex: 'column-1',
        key: 'column-1',
        title: 'number',
        width: 100,
      },
      {
        dataIndex: 'id',
        title: 'nick-1',
        key: 'column-21',
        maxWidth: 300,
        width: 150,
        align: 'center',
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {},
          }
          if (index === 6) {
            obj.props.rowSpan = 15
            obj.children = (
              <div
                style={{
                  width: 12,
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-line',
                  margin: 'auto',
                }}
              >
                行数据合并
              </div>
            )
          }

          if (index === 1) {
            obj.props.colSpan = 2
            obj.children = <div>列数据合并</div>
          }

          return obj
        },
      },
      {
        dataIndex: 'column-31',
        key: 'column-31',
        title: 'nick-2',
        width: 150,
        align: 'center',
      },

      {
        dataIndex: 'age',
        key: 'column-4',
        title: 'age',
        align: 'right',
      },
    ]

    let data = this.generateData(columns, 2000)

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
        overscanCount={15}
        virtual={true}
        data={data}
        selectMode="multiple"
        orderNumber={true}
      /></div>
    )
  }
}

export default Demo;
