import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "../selection";
import { getDataListWithExpanded, getTreeProps } from "./utils";

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

function isTree(data = []) {
  return data.findIndex(d => d.children instanceof Array === true) > -1;
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
      flatData: [],
      rawData: [],
      dataMap: {},
      columns: [],
      rowKey: "",
      isTree: false,
      treeProps: {},
      expandColumnKey: "",
      expandedRowKeys: expandedKeys,
      loadingKeys: [],
      disabledSelectKeys: [],
      indentSize: 20
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
      disabledSelectKeys,
      indentSize
    } = nextProps;

    //如果存在自定义展开行渲染，需要进行数据源处理
    let { data: nextData, keys } = formatExpandRenderData(
      data,
      rowKey,
      expandedRowRender
    );

    if (prevState.prevProps !== nextProps) {
      let nextState = {
        rowKey,
        columns: columns,
        prevProps: nextProps,
        expandColumnKey,
        disabledSelectKeys: disabledSelectKeys || [],
        indentSize,
        isTree: isTree(nextData)
      };

      if (data !== prevState.rawData) {
        let dataMap = {};
        let { treeProps, list } = getTreeProps(nextData, rowKey, function(d) {
          dataMap[d[rowKey]] = d;
        });

        nextState.treeProps = treeProps;
        nextState.flatData = list;
        nextState.rawData = data;
        nextState.dataMap = dataMap;
      }

      if ("expandedRowKeys" in nextProps) {
        nextState.expandedRowKeys = expandedRowKeys;
        if (expandedRowKeys.length > 0) {
          let { data } = getDataListWithExpanded(
            nextData,
            expandedRowKeys,
            rowKey
          );
          nextState.data = data;
        } else {
          nextState.data = nextData;
        }
      } else {
        let { expandedRowKeys: prevExpandedKeys } = prevState;
        if (prevExpandedKeys.length > 0) {
          let { data } = getDataListWithExpanded(
            nextData,
            prevExpandedKeys,
            rowKey
          );
          nextState.data = data;
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

    let { data: expandedData } = getDataListWithExpanded(
      rawData,
      nextExpandedKeys,
      rowKey
    );

    let nextState = {
      expandedRowKeys: nextExpandedKeys,
      data: expandedData
    };

    if (typeof this.props.onExpandedRowsChange === "function") {
      this.props.onExpandedRowsChange(nextExpandedKeys);
    }

    this.setState(nextState, () => {
      if (typeof this.props.loadChildrenData === "function") {
        this.loadChildrenData(key);
      }
    });
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
  setLoadingChildren = (key, bl, callback, reduceState) => {
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

    return this.setState({ loadingKeys: nextKeys, ...reduceState }, callback);
  };

  /**
   * 异步加载子级数据
   */
  loadChildrenData = key => {
    let { data, rowKey, rawData, expandedRowKeys } = this.state;

    let row = data.find(d => d[rowKey] === key);

    let res = this.props.loadChildrenData(row);

    if (res && res.constructor.name === "Promise") {
      this.setLoadingChildren(key, true, undefined);

      res.then(childrens => {
        let rebuildTreeState = {};
        if (childrens) {
          row.children = childrens;
          let dataMap = {};
          let { treeProps, list } = getTreeProps(rawData, rowKey, function(d) {
            dataMap[d[rowKey]] = d;
          });

          let { data: expandedData } = getDataListWithExpanded(
            rawData,
            expandedRowKeys,
            rowKey
          );

          rebuildTreeState = {
            data: expandedData,
            flatData: list,
            treeProps,
            dataMap
          };
        }

        this.setLoadingChildren(key, false, undefined, rebuildTreeState);
      });

      res.catch(e => {
        this.setLoadingChildren(key, false);
      });
    }
  };

  getTreeNode = key => {
    let { treeProps, dataMap } = this.state;
    let nodeInfo = (treeProps || {})[key];

    if (!nodeInfo) {
      return {};
    }

    let { index, treeIndex, depth, parents, orders } = nodeInfo;

    let rootKey = parents[0];
    let parentKey = parents[parents.length - 1] || "";
    let parent = null;

    if (parentKey) {
      parent = dataMap[parentKey];
    }

    return {
      key,
      depth,
      rootKey,
      parents,
      parentKey,
      parent,
      orders,
      treeIndex,
      index
    };
  };

  formatColumns = () => {
    let { columns, rowKey, expandColumnKey, indentSize, isTree } = this.state;

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
        let { depth = 0 } = this.getTreeNode(k);

        let isLoading = this.isLoadingChildren(k);
        let isExpanded = this.isExpanded(k);
        let hasChildren = this.hasChildren(row);
        let style = { marginLeft: depth * indentSize };
        return isTree ? (
          <div className="tablex-row-expand" style={style}>
            {hasChildren ? (
              <ExpandIcon
                loading={isLoading}
                expanded={isExpanded}
                rowKey={k}
                rowIndex={index}
                onChange={this.onExpand}
              />
            ) : null}
          </div>
        ) : null;
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
    let { rowKey, dataMap, treeProps } = this.state;

    let { rowData, rowIndex } = params;
    let fn = this.props.expandedRowRender;
    let fnRow = this.props.rowRender;
    let autoRowHeight = this.props.autoRowHeight;
    let styles = {};
    if (autoRowHeight === false) {
      styles = {
        height: "100%"
      };
    }

    if (typeof fn === "function") {
      if (rowData.__type === "__expandedRowRender") {
        let { rootKey } = this.getTreeNode(rowData[rowKey]);
        let nodeInfo = (treeProps || {})[rootKey];
        let root = dataMap[rootKey];
        let rootIndex = nodeInfo.index;

        return (
          <div className="tablex-row-expandedRowRender" style={styles}>
            {fn(root, rootIndex, params)}
          </div>
        );
      }
    }

    if (typeof fnRow === "function") {
      return fnRow(rowData, rowIndex, params);
    }
  };

  nodeInfo = ({ rowKey }) => {
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

  onRowClick = ({ rowIndex, rowKey }) => {
    let k = rowKey;
    let isExpanded = this.isExpanded(k);
    this.onExpand(!isExpanded, k, rowIndex);
  };

  onRow = (rowData, rowIndex, rowProps, rowExtra = {}) => {
    let fn = this.props.onRow;
    let rowKey = rowExtra.key;
    let o = {};
    if (typeof fn === "function") {
      o = fn(rowData, rowIndex, rowProps, rowExtra) || {};
    }

    return {
      ...o,
      onClick: e => {
        this.onRowClick({ rowIndex, rowKey });
        if (typeof o.onClick === "function") {
          o.onClick({ rowData, rowIndex, rowKey }, e);
        }
      }
    };
  };

  render() {
    let { data, flatData, disabledSelectKeys, treeProps, isTree } = this.state;
    let props = this.props;
    let columns = this.formatColumns();

    let newProps = {
      columns,
      data,
      flatData: flatData,
      treeProps,
      rowRender: this.rowRender,
      cellRenderExtra: this.nodeInfo,
      rowRenderExtra: this.nodeInfo,
      innerRef: this.innerRef,
      disabledSelectKeys
    };

    if (isTree && props.expandOnRowClick) {
      newProps.onRow = this.onRow;
    }

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
  defaultExpandedRowKeys: [],
  indentSize: 20,
  expandOnRowClick: false
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

  /** 每层的缩进宽度 */
  indentSize: PropTypes.number,

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

  /** 点击行时是否展开行 */
  expandOnRowClick: PropTypes.bool,

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
