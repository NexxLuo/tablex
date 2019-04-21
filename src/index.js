import React from "react";
import PropTypes from "prop-types";
import TableBody from "./components/body";
import TableHead from "./components/head";
import "./index.css";
import { treeToList, getDataListWithExpanded } from "./tree-data-utils";

import LoadingMsg from "./components/loading";

class Table extends React.Component {
  state = {
    rowKey: undefined,
    columns: [],
    columnLeafs: [],
    dataSource: [],
    dataList: [],

    expandedKeys: [],
    loadingKeys: []
  };

  onBodyScroll = ({ scrollLeft }) => {
    let head = this.refs["head"];
    head.scrollTo(scrollLeft, 0);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let { expandedKeys } = prevState;

    let { rowKey, columns, dataSource, loading } = nextProps;

    let { leafs: columnLeafs } = treeToList(columns);

    let dataList = dataSource;

    if (expandedKeys.length > 0) {
      dataList = getDataListWithExpanded(dataSource, expandedKeys, rowKey);
    }

    let nextState = {
      rowKey,
      columns,
      dataSource,
      columnLeafs,
      dataList,
      loading: !!loading
    };

    return nextState;
  }

  /**
   * @isExpand 是否展开
   * @key 受影响的行数据key
   */
  onExpandChange = (isExpand, key) => {
    isExpand === true ? this.collapse(key) : this.expand(key);
  };

  /**
   * 展开
   */
  expand = key => {
    let { expandedKeys } = this.state;

    let nextExpandedKeys = [...expandedKeys];

    let i = expandedKeys.indexOf(key);

    if (i === -1) {
      nextExpandedKeys.push(key);
    }

    this.setState({
      expandedKeys: nextExpandedKeys
    });

    if (typeof this.props.loadChildrenData === "function") {
      this.loadChildrenData(key);
    }
  };

  /**
   * 折叠
   */
  collapse = key => {
    let { expandedKeys } = this.state;

    let nextExpandedKeys = [...expandedKeys];

    let i = expandedKeys.indexOf(key);

    if (i > -1) {
      nextExpandedKeys.splice(i, 1);
    }

    this.setState({
      expandedKeys: nextExpandedKeys
    });
  };

  /**
   * 设置行的子级加载状态
   */
  setLoadingChildren = (key, bl, callback) => {
    let { loadingKeys } = this.state;

    let i = loadingKeys.indexOf(key);

    let nextKeys = [...loadingKeys];

    if (bl === true) {
      if (i === -1) {
        nextKeys.push(key);
      }
    } else {
      if (i > -1) {
        nextKeys.splice(i, 1);
      }
    }

    return this.setState({ loadingKeys: nextKeys }, callback);
  };

  /**
   * 异步加载子级数据
   */
  loadChildrenData = key => {
    let { dataList, rowKey } = this.state;

    let row = dataList.find(d => d[rowKey] === key);

    let res = this.props.loadChildrenData(row);

    if (res && res.constructor.name === "Promise") {
      this.setLoadingChildren(key, true);

      res.then(childrens => {
        if (childrens) {
          row.children = childrens;
        }

        this.setLoadingChildren(key, false);
      });

      res.catch(e => {
        this.setLoadingChildren(key, false);
      });
    }
  };

  render() {
    let {
      columns,
      columnLeafs,
      dataList,
      rowKey,
      expandedKeys,
      loadingKeys,
      loading
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
            loadingKeys={loadingKeys}
          />
          {loading === true ? <LoadingMsg /> : null}
        </div>
      </div>
    );
  }
}

Table.defaultProps = {
  columns: [],
  dataSource: [],
  loading: false
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
  dataSource: PropTypes.array.isRequired,
  /** 数据行主键字段
   * 主要用于行展开
   */
  rowKey: PropTypes.string.isRequired,
  /** 行展开变化事件
   * @expandedRows 展开的行
   */
  onExpandedRowsChange: PropTypes.func,
  rowIndent: PropTypes.number,
  expandedKeys: PropTypes.array,
  loadChildrenData: PropTypes.func,
  loading: PropTypes.bool
};

export default Table;
