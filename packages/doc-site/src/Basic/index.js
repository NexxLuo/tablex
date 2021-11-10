import React, { Component } from 'react';
import { Table, unflatten } from 'tablex';
import { Button, Input, Menu, InputNumber } from 'antd';
import _ from 'lodash';
import 'antd/dist/antd.css';

const { Search } = Input;

function createData(columns, count = 10, prefix = '') {
  let arr = [];
  for (let i = 0; i < count; i++) {
    let row = {
      id: prefix + 'row-' + i,
    };

    for (let j = 0; j < columns.length; j++) {
      let c = columns[j];
      let dataIndex = c?.dataIndex;
      if (dataIndex) {
        row[dataIndex] =  prefix +'row,' + i + ';column,' + j;
      }
    }

    arr.push(row);
  }

  return arr;
}

function createColumns(count) {
  let arr = [];

  for (let i = 0; i < count; i++) {
    let attrs = {};
    if (i === 0) {
      attrs.fixed = 'left';
    }
    arr.push({
      title: 'column-' + i,
      key: 'column-' + i,
      dataIndex: 'column-' + i,
      width: 100,
      ...attrs,
      render: (value, row, rowIndex, a, b) => {
        let s = {};

        if (rowIndex == 3 && i == 3) {
          s = { height: 60 };
        }
        return <span style={s}>{value}</span>;
      },
    });
  }

  return arr;
}

class Demo extends Component {
  state = {
    loading: false,
    treeData: [],
    columns: [],
  };

  getData = () => {
    let columns = createColumns(20);
    let arr = createData(columns, 100);

    arr[1].children = createData(columns, 10, 'children-');
    this.setState({ treeData: arr, columns: columns });
    console.log('columns:', columns);
  };

  scrollToItem = index => {
    if (this.actions) {
      this.actions.scrollToItem(index, 'center');
    }
  };

  expandTo = (depth = 1) => {
    this.actions.expandTo(depth);
  };

  expandAll = () => {
    this.actions.expandAll();
  };
  collapseAll = () => {
    this.actions.collapseAll();
  };

  rowKey = 'id';
  deleteRow = row => {
    let rowKey = this.rowKey;
    let key = row[rowKey];
    this.actions.deleteData([key]);
  };

  copiedRow = null;
  copy = row => {
    let rowData = {};

    for (const k in row) {
      if (row.hasOwnProperty(k) && k !== 'children') {
        rowData[k] = row[k];
      }
    }
    let str = JSON.stringify(rowData);
    this.copiedRow = JSON.stringify(rowData);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', str);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
    }
    document.body.removeChild(input);
  };

  pasteChildren = targetRow => {
    let rowKey = this.rowKey;

    let copiedRow = this.copiedRow;

    if (copiedRow) {
      let sourceRow = JSON.parse(copiedRow);
      sourceRow[rowKey] = 'copied_row_' + sourceRow[rowKey];

      this.actions.insertData({
        data: [sourceRow],
        parentKey: targetRow[rowKey],
        editing: true,
        scrollTo: false,
      });

      this.isCut = false;
      this.copiedRow = null;
    }
  };

  isCut = false;
  cut = row => {
    this.copy(row);
    this.isCut = true;
  };

  selectAll = rowData => {
    this.actions.selectToggle(rowData);
  };

  expandToggle = rowData => {
    this.actions.expandToggle(rowData);
  };

  onMenuClick = ({ key, item }) => {
    console.log('key:', item.props.row);

    let actions = {
      del: this.deleteRow,
      copy: this.copy,
      cut: this.cut,
      pasteChildren: this.pasteChildren,
      selectAll: this.selectAll,
      expandToggle: this.expandToggle,
      export: this.export,
    };

    let fn = actions[key];
    if (typeof fn === 'function') {
      fn(item.props.row);
    }
  };

  searchIndex = -1;
  searchedKey = '';
  onChangeSearch = () => {
    this.searchIndex = 0;
    this.searchedKey = '';
  };

  onSearch = v => {
    if (!v) {
      this.searchIndex = 0;
      this.searchedKey = '';
      this.scrollToItem(-1);
      this.forceUpdate();
      return;
    }

    //先展开所有以便查询定位
    this.expandAll();

    let searchedIndex = -1;
    let searchedKey = '';

    let f = this.actions.findData(d => d.name.indexOf(v) > -1, {
      startIndex: this.searchIndex,
      startRowKey: this.searchedKey,
      focused: true,
    });

    if (f) {
      searchedIndex = f.index;
      searchedKey = f.row.id;
    }

    if (searchedIndex > -1) {
      this.searchIndex = searchedIndex + 1;
      this.searchedKey = searchedKey;
    } else {
      this.searchIndex = -1;
      this.searchedKey = '';
    }
  };

  onFilter = v => {
    let { treeData } = this.state;
    if (!v) {
      this.setState({ treeData: treeData.slice() }, this.collapseAll);
      return;
    }

    this.actions.filterData(d => {
      return d.name.indexOf(v) > -1;
    });

    this.expandAll();
  };

  actions = {};
  componentDidMount() {
    console.log('actions:', this.actions);
    this.getData();
  }

  render() {
    return (
      <div style={{ height: '600px' }}>
        <Table
          rowKey="id"
          editable={true}
          ref="tb"
          loading={this.state.loading}
          columns={this.state.columns}
          autoRowHeight={true}
          selectMode="multiple"
          checkStrictly={false}
          virtual={true}
          data={this.state.treeData}
          autoRowHeight={false}
          orderNumber={{ resizable: true }}
          contextMenu={this.contentMenu}
          validateTrigger="onChange"
          isAppend={true}
          actions={this.actions}
        />
      </div>
    );
  }
}

export default Demo;
