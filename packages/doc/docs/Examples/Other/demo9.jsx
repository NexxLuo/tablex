import React from 'react';
import Table from 'tablex';
import { Input, Button } from "antd";

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
    let { hideColumn, columnWidth, columnFixed } = this.state
    let columns = [
      {
        dataIndex: 'id',
        title: 'id',
        key: 'id',
        width: 150,
        hidden: !!hideColumn,
        align: 'center',
      },
      {
        dataIndex: 'column-1',
        key: 'column-1',
        title: 'column-1',
        width: columnWidth ? columnWidth : 100,
      },

      {
        dataIndex: 'column-2',
        key: 'column-2',
        title: 'column-2',
        width: 150,
        align: 'center',
        fixed: columnFixed ? columnFixed : false,
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
  hideColumn() {
    this.setState({ hideColumn: !this.state.hideColumn })
  }
  setColumnWidth() {
    let w = Math.ceil(Math.random(9) * 100) + 100
    this.setState({ columnWidth: w })
  }
  setColumnFixed() {
    let fixed = this.state.columnFixed || false
    let newFixed = false
    if (fixed === 'left') {
      newFixed = 'right'
    } else if (fixed === 'right') {
      newFixed = false
    } else {
      newFixed = 'left'
    }
    this.setState({ columnFixed: newFixed })
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
        orderNumber={true}
        header={() => {
          return (
            <div>
              <Button onClick={this.hideColumn.bind(this)}>
                显示/隐藏列
              </Button>
              <Button
                onClick={this.setColumnWidth.bind(this)}
                style={{ marginLeft: 5 }}
              >
                控制列宽
              </Button>
              <Button
                onClick={this.setColumnFixed.bind(this)}
                style={{ marginLeft: 5 }}
              >
                控制列固定
              </Button>
            </div>
          )
        }}
      /></div>
    )
  }
}

export default Demo;
