import { Input, InputNumber, Select } from 'antd';
import React from 'react';
import Table from 'tablex';

const Search = Input.Search;
class Demo extends React.Component {
  generateData(columns, count = 20, prefix = 'Row') {
    return new Array(count).fill(0).map((row, rowIndex) => {
      return columns.reduce(
        (rowData, column, columnIndex) => {
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
  constructor(props) {
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
        title: 'column-1',
        width: 100,
        validator: function (value, row) {
          if (!value) {
            return { valid: false, message: '请输入' };
          }

          return { valid: true, message: 'false' };
        },
        editor: function (value, row, index, onchange, ref) {
          return (
            <Search
              allowClear
              defaultValue={'1'}
              ref={ref}
              placeholder="请输入"
              onChange={(e) => onchange({ ['column-1']: value })}
            />
          );
        },
      },

      {
        dataIndex: 'column-2',
        title: 'column-2',
        width: 150,
        align: 'center',
        editor: function (value, row, index, onchange, ref) {
          return (
            <InputNumber
              defaultValue={value}
              ref={ref}
              onChange={(e) => onchange({ ['column-2']: e })}
            />
          );
        },
      },
      {
        dataIndex: 'column-3',
        title: 'column-3',
        align: 'right',
        editor: function (value, row, index, onchange, ref) {
          return <Select defaultValue={value} ref={ref} />;
        },
      },
      {
        dataIndex: 'column-4',
        title: 'column-4',
        width: 100,
        align: 'center',
      },
    ];

    let data = this.generateData(columns, 10);

    data[1].children = this.generateData(columns, 3, 'children-');

    this.state = {
      data: data,
      columns: columns,
    };
  }
  onEditSave(changedRows, newData, type) {
    console.log('onEditSave:', newData);
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        reject('asdsa');
        console.log('reject after');
      }, 1000);
    }).catch((e) => {
      console.log('catch');
      throw e;
    });
  }
  render() {
    let { columns, data } = this.state;
    return (
      <div style={{ height: 400 }}>
        <Table
          rowKey="id"
          columns={columns}
          validateTrigger="onChange"
          data={data}
          editable={true}
          keyboardNavigation={true}
          alwaysValidate={true}
          isAppend={false}
          allowSaveEmpty={false}
          selectMode={'multiple'}
          hiddenToolsWhenEditting={["delete"]}
          checkStrictly={false}
          editTools={['edit', 'add', 'delete']}
          onEditSave={this.onEditSave.bind(this)}
        />
      </div>
    );
  }
}

export default Demo;
