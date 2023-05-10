import * as All from 'antd';
import React from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { DraggableTable, Table } from 'tablex';

const theme = {
  plain: {
    color: '#393A34',
    backgroundColor: '#f6f8fa',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#999988',
        fontStyle: 'italic',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#e3116c',
      },
    },
    {
      types: ['punctuation', 'operator'],
      style: {
        color: '#393A34',
      },
    },
    {
      types: [
        'entity',
        'url',
        'symbol',
        'number',
        'boolean',
        'variable',
        'constant',
        'property',
        'regex',
        'inserted',
      ],
      style: {
        color: '#36acaa',
      },
    },
    {
      types: ['atrule', 'keyword', 'attr-name', 'selector'],
      style: {
        color: '#00a4db',
      },
    },
    {
      types: ['function', 'deleted', 'tag'],
      style: {
        color: '#d73a49',
      },
    },
    {
      types: ['function-variable'],
      style: {
        color: '#6f42c1',
      },
    },
    {
      types: ['tag', 'selector', 'keyword'],
      style: {
        color: '#00009f',
      },
    },
  ],
};

const codeText = `class Demo extends React.Component {
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
      <div style={{ height: 400,overflow:"auto" }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height:"100%",
            width: '100%',
          }}
        >
          <div style={{ height: '100%' }}>
            <Table
              rowKey="id"
              columns={columns}
              data={data}
            />
          </div>
        </div>
      </div>
    );
  }
}
`;

const Playground = () => {
  return (
    <LiveProvider
      code={codeText}
      scope={{ ...All, Table, DraggableTable }}
      theme={theme}
    >
      <LivePreview />
      <div
        style={{
          maxHeight: 500,
          overflow: 'auto',
          color: 'red',
          backgroundColor: 'rgba(254,226,226,1)',
          borderRadius: 4,
        }}
      >
        <LiveError style={{ margin: 0, padding: 12 }} />
      </div>
      <div
        style={{
          maxHeight: 500,
          overflow: 'auto',
          marginTop: 12,
          borderRadius: 4,
          border: '1px solid #e4e9ec',
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <LiveEditor />
      </div>
    </LiveProvider>
  );
};

export default Playground;
