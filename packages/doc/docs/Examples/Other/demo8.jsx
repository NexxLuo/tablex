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
    }
  }
  onMenuClick({ key, item }) {
    console.log(key, item.props.row)
  }
  contextMenu(row) {
    let menuItemStyle = { height: 'auto', lineHeight: 'normal' }
    return (
      <div>
        <Menu selectable={false} onClick={this.onMenuClick}>
          <Menu.Item key="del" style={menuItemStyle} row={row}>
            删除行
          </Menu.Item>
          <Menu.Item key="copy" style={menuItemStyle} row={row}>
            复制行
          </Menu.Item>
          <Menu.Item key="cut" style={menuItemStyle} row={row}>
            剪切行
          </Menu.Item>
          <Menu.Item key="pasteChildren" style={menuItemStyle} row={row}>
            粘贴行(下级)
          </Menu.Item>
          <Menu.Item key="selectAll" style={menuItemStyle} row={row}>
            全选/全否
          </Menu.Item>
          <Menu.Item key="expandToggle" style={menuItemStyle} row={row}>
            展开/收缩
          </Menu.Item>
          <Menu.Item key="export" style={menuItemStyle} row={row}>
            导出
          </Menu.Item>
          <Menu.Item key="print" style={menuItemStyle} row={row}>
            打印
          </Menu.Item>
        </Menu>
      </div>
    )
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
        contextMenu={this.contextMenu.bind(this)}
      /></div>
    )
  }
}
  
export default Demo;
