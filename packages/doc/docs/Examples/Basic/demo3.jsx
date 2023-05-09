import React from 'react';
import Table from 'tablex';

class Demo extends React.Component {
  generateData(columns, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
          rowData[column.dataIndex] =
            prefix + ' ' + rowIndex + ' - Col ' + columnIndex;
          return rowData;
        },
        {
          id: prefix + rowIndex,
          parentId: null,
        },
      );
    });
  }
  constructor(props) {
    super(props);
    const columns = [
      {
        dataIndex: 'column-1',
        key: 'column-1',
        title: 'number',
        width: 200,
      },
      {
        dataIndex: 'id',
        title: 'nick-1',
        key: 'column-21',
        align: 'center',
        width: 200,
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
        width: 200,
      },
    ];

    let data = this.generateData(columns, 20);

    data.forEach((d) => {
      d.children = this.generateData(columns, 5, 'children-' + d.id);
    });

    this.state = {
      data: data,
      columns: columns,
    };
  }
  render() {
    let { columns, data } = this.state;
    return (
      <Table
        rowKey="id"
        columns={columns}
        data={data}
        selectMode="multiple"
        orderNumber={{
          width: 100,
          title: 'No.',
          align: 'left',
          resizable: true,
          fixed: 'left',
          render: function (value, row, index, extra) {
            let { orders = [] } = extra;
            return orders.join('-');
          },
        }}
      />
    );
  }
}

export default Demo;
