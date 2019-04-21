import React from "react";
import PropTypes from "prop-types";
import TableBody from "./components/body";
import TableHead from "./components/head";
import "./index.css";
import { treeToList, getDataListWithExpanded } from "./tree-data-utils";

class Table extends React.Component {
  state = {
    rowKey: undefined,
    columns: [],
    columnLeafs: [],
    dataSource: [],
    dataList: [],

    expandedKeys: []
  };

  onBodyScroll = ({ scrollLeft }) => {
    let head = this.refs["head"];
    head.scrollTo(scrollLeft, 0);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let { expandedKeys } = prevState;

    let { rowKey, columns, dataSource } = nextProps;

    let { leafs: columnLeafs } = treeToList(columns);

    let dataList = dataSource;

    if (expandedKeys.length > 0) {
      dataList = getDataListWithExpanded(dataSource, expandedKeys, rowKey);
    }

    let nextState = { rowKey, columns, dataSource, columnLeafs, dataList };

    return nextState;
  }

  /**
   * @isExpand 是否展开
   * @key 受影响的行数据key
   */
  onExpandChange = (isExpand, key) => {
    let { expandedKeys } = this.state;

    let nextExpandedKeys = [...expandedKeys];

    let i = expandedKeys.indexOf(key);

    if (isExpand === true) {
      if (i > -1) {
        nextExpandedKeys.splice(i, 1);
      }
    } else {
      if (i === -1) {
        nextExpandedKeys.push(key);
      }
    }

    this.setState(
      {
        expandedKeys: nextExpandedKeys
      }
    );
  };

  render() {
    let {
      columns,
      columnLeafs,
      dataList,
      rowKey,
      expandedKeys
    } = this.state;

    return (
      <div className="tablex">
        <div className="tablex-head" ref="head">
          <TableHead columns={columns} columnLeafs={columnLeafs} />
        </div>

        <div className="tablex-body">
          <TableBody
            rowKey={rowKey}
            columns={columns}
            columnLeafs={columnLeafs}
            dataSource={dataList}
            onScroll={this.onBodyScroll}
            onExpandChange={this.onExpandChange}
            expandedKeys={expandedKeys}
          />
        </div>
      </div>
    );
  }
}

Table.defaultProps = {
  columns: [],
  dataSource: []
};

Table.propTypes = {
  /**
   * 表格列
   *
   */
  columns: PropTypes.array.isRequired,

  /**
   * 表格数据
   */
  dataSource: PropTypes.array.isRequired
};

export default Table;
