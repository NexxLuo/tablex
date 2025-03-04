import React from 'react';
import Table from 'tablex';
import { Input, Button } from 'antd';


class EditDemo extends React.Component<any, any> {
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

  tableRef = React.createRef(null);
  constructor(props: any) {
    super(props);

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
        editor: (value, row, index, onchange, ref) => {
          return (
            <Input
              value={value}
              onChange={(e) => {
                console.log('row:', row);
                this.tableRef.current.api.modifyData([
                  { ...row, 'column-1': e.target.value },
                ]);
                //  this.tableRef.current.api.commitEdit()

                //    onchange({'column-1':e.target.value})
              }}
            />
          );
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
    ];

    let data = this.generateData(columns, 20);

    this.state = {
      data: data,
      columns: columns,
    };
  }

  render() {
    let { columns, data } = this.state;

    return (
      <div style={{ height: 400 }}>
        <Table
          ref={this.tableRef}
          rowKey="id"
          columns={columns}
          data={data}
          tableId="memorize_table"
          columnDropMenu={true}
          settable={true}
          editable={true}
          validateTrigger="onChange"
          onEditSave={(changed, nextData) => {
            this.setState({ data: nextData });
          }}
        />
        <Button
          onClick={() => {
            console.log('data:', this.state.data);
            console.log('data 1:',this.tableRef.current.api.getAllData().data);

          }}
        >
          获取数据
        </Button>
      </div>
    );
  }
}


class Demo extends React.Component<any, any> {
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
    ];

    let data = this.generateData(columns, 20);

    this.state = {
      data: data,
      columns: columns,
    };
  }

  render() {
    let { columns, data } = this.state;

    return (
      <div style={{ height: 400 }}>
        <Table
          rowKey="id"
          columns={columns}
          data={data}
          tableId="memorize_table"
          columnDropMenu={true}
          settable={true}
        />
      </div>
    );
  }
}

export default Demo;