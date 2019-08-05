import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "../selection";
import { getDataListWithExpanded, getTreeProps } from "./utils";
import { getFlatDataFromTree } from "./tree-utils";

import ExpandIcon from "./ExpandIcon";
import "./styles.css";

function formatExpandRenderData(data, rowKey, render) {
  let nextData = data;

  let keys = [];

  if (typeof render === "function") {
    let arr = [];
    data.forEach((d, i) => {
      let key = "__expandedRowRender_" + d[rowKey];
      keys.push(key);
      arr.push(
        Object.assign({}, d, {
          children: [
            {
              __type: "__expandedRowRender",
              [rowKey]: key
            }
          ]
        })
      );
    });

    nextData = arr;
  }

  return { data: nextData, keys: keys };
}

class TreeGrid extends Component {
  constructor(props) {
    super(props);

    let expandedKeys = [];

    if (props.defaultExpandedRowKeys instanceof Array === true) {
      expandedKeys = props.defaultExpandedRowKeys;
    }

    this.state = {
      prevProps: null,
      data: [],
      rawData: [],
      columns: [],
      rowKey: "",

      treeProps: {},
      expandColumnKey: "",
      expandedRowKeys: expandedKeys,
      loadingKeys: [],
      disabledSelectKeys: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let {
      data,
      columns,
      rowKey,
      expandColumnKey,
      expandedRowRender,
      expandedRowKeys,
      disabledSelectKeys
    } = nextProps;

    //如果存在自定义展开行渲染，需要进行数据源处理
    let { data: nextData, keys } = formatExpandRenderData(
      data,
      rowKey,
      expandedRowRender
    );

    if (prevState.prevProps !== nextProps) {
      let treeProps = getTreeProps(nextData, rowKey);
      let nextState = {
        rowKey,
        data: nextData,
        rawData: data,
        treeProps: treeProps,
        columns: columns,
        prevProps: nextProps,
        expandColumnKey,
        disabledSelectKeys: disabledSelectKeys || []
      };

      if ("expandedRowKeys" in nextProps) {
        nextState.expandedRowKeys = expandedRowKeys;
        if (expandedRowKeys.length > 0) {
          let { data, treeProps } = getDataListWithExpanded(
            nextData,
            expandedRowKeys,
            rowKey
          );
          nextState.data = data;
          nextState.treeProps = treeProps;
        }
      } else {
        let { expandedRowKeys: prevExpandedKeys } = prevState;
        if (prevExpandedKeys.length > 0) {
          let { data, treeProps } = getDataListWithExpanded(
            nextData,
            prevExpandedKeys,
            rowKey
          );
          nextState.data = data;
          nextState.treeProps = treeProps;
        } else {
          nextState.data = nextData;
        }
      }

      if (keys.length > 0) {
        nextState.disabledSelectKeys = (disabledSelectKeys || []).concat(keys);
      }

      return nextState;
    }

    return null;
  }

  isLoadingChildren = key => {
    let { loadingKeys } = this.state;
    return loadingKeys.indexOf(key) > -1;
  };

  isTree = () => {
    return (
      this.state.data.findIndex(d => d.children instanceof Array === true) > -1
    );
  };

  isExpanded = key => {
    let { expandedRowKeys } = this.state;
    return expandedRowKeys.indexOf(key) > -1;
  };

  hasChildren = row => {
    return row.children instanceof Array === true;
  };

  onExpand = (expanded, key, index) => {
    if (typeof this.props.onExpand === "function") {
      let { data, rowKey } = this.state;
      let r = data.find(d => d[rowKey] === key);
      this.props.onExpand(expanded, r);
    }

    expanded === true ? this.expand(key) : this.collapse(key);

    this.resetAfterIndex(index);
  };

  /**
   * 展开
   */
  expand = key => {
    let { expandedRowKeys: expandedKeys, rowKey, rawData } = this.state;

    let nextExpandedKeys = [...expandedKeys];

    let i = expandedKeys.indexOf(key);

    if (i === -1) {
      nextExpandedKeys.push(key);
    }

    let bd1 = new Date();

    let { data: expandedData } = getDataListWithExpanded(
      rawData,
      nextExpandedKeys,
      rowKey
    );


    this.setState({
      expandedRowKeys: nextExpandedKeys,
      data: expandedData
    });

    if (typeof this.props.onExpandedRowsChange === "function") {
      this.props.onExpandedRowsChange(nextExpandedKeys);
    }

    if (typeof this.props.loadChildrenData === "function") {
      this.loadChildrenData(key);
    }
  };

  /**
   * 折叠
   */
  collapse = key => {
    let { expandedRowKeys: expandedKeys, rawData, rowKey } = this.state;

    let nextExpandedKeys = [...expandedKeys];

    let i = expandedKeys.indexOf(key);

    if (i > -1) {
      nextExpandedKeys.splice(i, 1);
    }

    let { data: expandedData } = getDataListWithExpanded(
      rawData,
      nextExpandedKeys,
      rowKey
    );

    this.setState({
      expandedRowKeys: nextExpandedKeys,
      data: expandedData
    });

    if (typeof this.props.onExpandedRowsChange === "function") {
      this.props.onExpandedRowsChange(nextExpandedKeys);
    }
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
    let { data, rowKey } = this.state;

    let row = data.find(d => d[rowKey] === key);

    let res = this.props.loadChildrenData(row);

    if (res && res.constructor.name === "Promise") {
      this.setLoadingChildren(key, true);
      this.forceUpdate();
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

  getTreeNode = key => {
    let { treeProps, data, rowKey } = this.state;
    let p = (treeProps || {})[key] || {};
    let depth = p.depth || 0;
    let parents = p.parents || [];
    let rootKey = parents[0];
    let rootIndex = data.findIndex(d => d[rowKey] === rootKey);
    let root = data[rootIndex];

    return { depth, root, rootIndex, parents, orders: p.orders };
  };

  formatColumns = () => {
    let { columns, rowKey, expandColumnKey } = this.state;
    let isTree = this.isTree();

    let expandColumn = null;

    if (!expandColumnKey) {
      let firstLeft = columns.find(d => d.fixed === "left");
      if (firstLeft) {
        expandColumn = firstLeft;
      } else {
        expandColumn = columns[0];
      }
    } else {
      expandColumn = columns.find(d => {
        let columnKey = d.key || d.dataIndex;
        return columnKey === expandColumnKey;
      });
    }

    if (expandColumn) {
      expandColumn.prependRender = (value, row, index) => {
        let k = row[rowKey];
        let { depth } = this.getTreeNode(k);

        let isLoading = this.isLoadingChildren(k);
        let isExpanded = this.isExpanded(k);
        let hasChildren = this.hasChildren(row);
        let style = { marginLeft: depth * 20 };
        return (
          <span>
            {hasChildren ? (
              <ExpandIcon
                loading={isLoading}
                expanded={isExpanded}
                rowKey={k}
                rowIndex={index}
                onChange={this.onExpand}
                style={style}
              />
            ) : isTree ? (
              <div className="tablex-row-expand" style={style} />
            ) : null}
          </span>
        );
      };
    }

    return columns;
  };

  dataGridRef = null;
  innerRef = ins => {
    this.dataGridRef = ins;
    if (typeof this.props.innerRef === "function") {
      this.props.innerRef(ins);
    }
  };

  resetAfterIndex(index, shouldForceUpdate) {
    this.dataGridRef &&
      this.dataGridRef.resetAfterIndex(index, shouldForceUpdate);
  }

  rowRender = params => {
    let { rowKey, rawData } = this.state;

    let { rowData, rowIndex } = params;
    let fn = this.props.expandedRowRender;
    let fnRow = this.props.rowRender;

    if (typeof fn === "function") {
      if (rowData.__type === "__expandedRowRender") {
        let { root, rootIndex } = this.getTreeNode(rowData[rowKey]);
        return fn(root, rootIndex, params);
      }
    }

    if (typeof fnRow === "function") {
      return fnRow(rowData, rowIndex, params);
    }
  };

  cellRenderExtra = ({ rowKey }) => {
    let p = this.getTreeNode(rowKey);
    return p;
  };

  rowHeightWithExpandRender = (rowData, rowIndex) => {
    let { expandRowHeight, rowHeight } = this.props;

    let h = 40;

    if (rowData.__type === "__expandedRowRender") {
      if (typeof expandRowHeight === "function") {
        h = expandRowHeight(rowData, rowIndex);
      } else {
        h = expandRowHeight;
      }
    } else {
      if (typeof rowHeight === "function") {
        h = rowHeight(rowData, rowIndex);
      } else {
        h = rowHeight || 40;
      }
    }

    return h;
  };

  render() {
    let { data, disabledSelectKeys, treeProps } = this.state;
    let props = this.props;
    let columns = this.formatColumns();

    let newProps = {
      columns,
      data,
      flatData: data,
      treeProps,
      rowRender: this.rowRender,
      cellRenderExtra: this.cellRenderExtra,
      innerRef: this.innerRef,
      disabledSelectKeys
    };

    if (typeof props.expandedRowRender === "function") {
      newProps.rowHeight = this.rowHeightWithExpandRender;
    }

    return <Table {...props} {...newProps} />;
  }
}

TreeGrid.defaultProps = {
  columns: [],
  data: [],
  rowKey: "key",
  expandColumnKey: "",
  expandRowHeight: 100,
  defaultExpandedRowKeys: []
};

TreeGrid.propTypes = {
  /**
   * 表格列
   *
   */
  columns: PropTypes.array.isRequired,
  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,
  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired,

  /** 展开行渲染 */
  expandedRowRender: PropTypes.func,

  /** 展开行高度 */
  expandRowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

  /** 展开按钮所在的列 */
  expandColumnKey: PropTypes.string,

  /** 默认展开的行 */
  defaultExpandedRowKeys: PropTypes.array,

  /** 展开的行键值 */
  expandedRowKeys: PropTypes.array,
  /**
   * 行展开事件
   * (expandedRowKeys:Array) => void
   * */
  onExpandedRowsChange: PropTypes.func,

  /**
   * 点击展开图标时触发
   */
  onExpand: PropTypes.func,

  /**
   * 展开时加载children的方法
   * (row:object) => Promise
   * */
  loadChildrenData: PropTypes.func
};

export default TreeGrid;
