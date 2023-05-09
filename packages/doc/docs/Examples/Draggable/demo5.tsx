import 'antd/dist/antd.css';
import React from 'react';
import { DraggableTable } from 'tablex';

export default class Demo extends React.Component<any, any> {
  generateData(columns: any, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData: any, column: any, columnIndex: any) => {
          if (column.dataIndex !== 'id') {
            rowData[column.dataIndex] = Math.floor(Math.random() * 100 + 1);
          } else {
            rowData[column.dataIndex] =
              prefix + ' ' + rowIndex + ' - Col ' + columnIndex;
          }

          return rowData;
        },
        {
          id: prefix + rowIndex,
          parentId: null,
        },
      );
    });
  }

  constructor(props: any) {
    super(props);

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
        render: function () {
          return (
            <span
              className="customDragHandle"
              style={{ backgroundColor: '#ccc' }}
            >
              drag me
            </span>
          );
        },
      },

      {
        dataIndex: 'column-2',
        key: 'column-2',
        title: 'column-2',
        width: 150,
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
    ];

    let data = this.generateData(columns, 20);

    this.state = {
      data: data,
      columns: columns,
    };
  }

  onDragComplete(result: any) {
    console.log('onDragComplete:', result);
  }

  render() {
    let { columns, data } = this.state;

    return (
      <div style={{ height: 400 }}>
        <DraggableTable
          rowKey="id"
          columns={columns}
          data={data}
          dragHandleSelector=".customDragHandle"
          onDragComplete={this.onDragComplete.bind(this)}
        />
      </div>
    );
  }
}
