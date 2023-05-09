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

      this.state = {
        data: data,
        columns: columns,
        current: 1,
        pageSize: 10,
        total: data.length,
      }
    }
    onPageChange(pageIndex, pageSize) {
      this.setState({
        current: pageIndex,
        pageSize,
      })
    }
    onRefresh(pageIndex, pageSize) {
      this.setState({
        current: pageIndex,
        pageSize,
      })
    }
    render() {
      let { columns, data, current, pageSize, total } = this.state
      return (
        <div style={{ height: 400 }}><Table
          rowKey="id"
          columns={columns}
          selectMode="multiple"
          checkStrictly={true}
          onSelectChange={function(a, b, c, d) {
            console.log('onSelectChange rows2:', a, b, c)
            return true
          }}
          data={data}
          pagination={{
            current,
            pageSize,
            total,
            onPageChange: this.onPageChange.bind(this),
            onRefresh: this.onRefresh.bind(this),
          }}
        /></div>
      )
    }
  }

export default Demo;
