import React from "react";
import PropTypes from "prop-types";
import BaseTable from "react-base-datagrid";
import ContextMenu from "./components/ContextMenu";
import Pagination from "./components/pagination";
import ColumnDropMenu, {
  ColumnDropMenuButton
} from "./components/ColumnDropMenu";
import Setting, { getConfigs, setConfigs } from "./components/setting";
import SortIcon from "./components/SortIndicator";
import EmptyIcon from "./components/EmptyIcon";
import { Spin, Popover, Button } from "./widgets";

import {
  treeToFlatten as treeToList,
  treeFilter,
  getParentElement,
  getGroupedData
} from "./utils";
import orderBy from "lodash/orderBy";
import cloneDeep from "lodash/cloneDeep";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import sumBy from "lodash/sumBy";

const DEFAULT_COLUMN_WIDTH = 100;

let summaryMath = {
  max: (items, key) => {
    let r =
      maxBy(items, function(o) {
        return o[key];
      }) || {};

    return r[key];
  },
  min: (items, key) => {
    let r =
      minBy(items, function(o) {
        return o[key];
      }) || {};

    return r[key];
  },
  average: (items, key) => {
    let sum = sumBy(items, function(o) {
      return o[key];
    });

    if (sum === undefined) {
      return "";
    } else {
      return sum / items.length;
    }
  },
  avg: (items, key) => {
    let sum = sumBy(items, function(o) {
      return o[key];
    });

    if (sum === undefined) {
      return "";
    } else {
      return sum / items.length;
    }
  },
  sum: (items, key) => {
    let r = sumBy(items, function(o) {
      return o[key];
    });

    return r;
  }
};

function orderNumberCellRender(value, rowData, index) {
  return index + 1;
}

function isNumber(v) {
  if (typeof v !== "number") {
    return false;
  }
  if (isNaN(v - 0)) {
    return false;
  } else {
    return true;
  }
}

/**
 * 表格
 */
class Table extends React.Component {
  dropdown_button_ref = React.createRef();
  contextmenu_ref = React.createRef();

  constructor(props) {
    super(props);

    let configs = {};
    let configedGroupedColumnKey = props.defaultGroupedColumnKey;

    let sorted = [];

    if (props.tableId) {
      configs = getConfigs(props.tableId) || {};
      if ("groupedColumnKey" in configs) {
        configedGroupedColumnKey = configs.groupedColumnKey;
      }

      if (props.memorizeSortedColumns === true) {
        if ("sortedColumns" in configs) {
          sorted = configs.sortedColumns;
        }
      }
    }

    this.state = {
      prevProps: null,
      pagination: false,
      data: [],
      rawData: [],
      columns: [],
      columnDropMenu: false,
      sortable: false,
      columnsConfig: configs.columnsConfig || null,
      groupedColumnKey: configedGroupedColumnKey || [],
      sortedColumns: sorted,
      columnMenu: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let {
        columns,
        prependColumns = [],
        columnDropMenu,
        sortable
      } = nextProps;

      let data = nextProps.data || nextProps.dataSource || [];

      //给列key、width设置缺省值
      let columnsArr = treeFilter(columns, (d, i, { depth, treeIndex }) => {
        if (!d.key) {
          d.key = d.dataIndex || depth + "-" + i + "-" + treeIndex;
        }

        if (depth > 0) {
          if (!isNumber(d.width)) {
            d.width = DEFAULT_COLUMN_WIDTH;
          }
        }

        return true;
      });
      //

      nextState = {
        columns: cloneDeep(columnsArr),
        data: data,
        rawData: data,
        rawColumns: columnsArr,
        columnDropMenu,
        sortable,
        prevProps: nextProps
      };

      let extraColumns = [];

      if ("groupedColumnKey" in nextProps) {
        nextState.groupedColumnKey = nextProps.groupedColumnKey;
      }

      if ("orderNumber" in nextProps) {
        let orderColumn = nextProps.orderNumber;
        let hasOrderNumber = false;

        if (orderColumn !== false && orderColumn !== null) {
          hasOrderNumber = true;
        }

        if (hasOrderNumber === true) {
          let orderNumberColumn = {
            key: "__ordernumber_column",
            dataIndex: "__ordernumber_column",
            __type: "__ordernumber_column",
            resizable: false,
            width: 50,
            align: "center",
            render: orderNumberCellRender,
            title: nextProps.intl.orderNumberTitle
          };
          if (orderColumn instanceof Object) {
            orderNumberColumn = Object.assign(
              {},
              orderNumberColumn,
              orderColumn
            );
          }

          extraColumns.unshift(orderNumberColumn);
        }
      }

      nextState.prependColumns = prependColumns.concat(extraColumns);
    }

    if ("pagination" in nextProps) {
      nextState.pagination = nextProps.pagination;

      const newPagination = {
        ...prevState.pagination,
        ...nextProps.pagination
      };
      newPagination.current = newPagination.current || 1;

      //如果开启了pageSize记忆才使用记忆配置中的pageSize
      if (nextProps.memorizePageSize === true) {
        let savedConfigs = getConfigs(nextProps.tableId) || {};
        if (typeof savedConfigs.pageSize === "number") {
          newPagination.pageSize = savedConfigs.pageSize;
        }
      }
      //

      newPagination.pageSize = newPagination.pageSize || 10;

      if (nextProps.pagination !== false && nextProps.pagination !== null) {
        nextState.pagination = newPagination;
      } else {
        nextState.pagination = {};
      }

      return nextState;
    }

    if (Object.keys(nextState).length === 0) {
      return null;
    }

    return nextState;
  }

  actions = {
    getColumnConfigs: () => {
      return this.state.columnsConfig;
    }
  };

  componentDidMount() {
    let fn = this.props.onMount;
    if (typeof fn === "function") {
      let { pagination } = this.state;
      if (typeof pagination === "object" && pagination) {
        fn(pagination.current, pagination.pageSize);
      } else {
        fn();
      }
    }

    let o = this.props.actions;
    if (o && typeof o === "object") {
      let actions = this.actions;
      for (const k in actions) {
        o[k] = actions[k];
      }
    }
  }

  hasPagination() {
    return this.props.pagination !== false;
  }

  onPageChange = (pageIndex, pageSize) => {
    let { pagination } = this.state;
    let fn = this.state.pagination.onPageChange;

    if (this.props.resetScrollOffset) {
      this.scrollToFirst();
    }

    if (typeof fn === "function") {
      fn(pageIndex, pageSize);
    } else {
      this.setState({
        pagination: {
          ...pagination,
          current: pageIndex,
          pageSize
        }
      });
    }
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    let { pagination } = this.state;
    let fn = this.state.pagination.onPageChange;
    let fn_sizeChange = this.state.pagination.onShowSizeChange;

    if (this.props.resetScrollOffset) {
      this.scrollToFirst();
    }

    setConfigs(this.props.tableId, {
      pageSize: pageSize
    });

    if (typeof fn_sizeChange === "function") {
      fn_sizeChange(pageIndex, pageSize);
    } else if (typeof fn === "function") {
      fn(pageIndex, pageSize);
    } else {
      this.setState({
        pagination: {
          ...pagination,
          pageSize
        }
      });
    }
  };
  onRefresh = () => {
    let fn = this.props.onRefresh;
    if (typeof fn === "function") {
      let { pagination } = this.state;
      let p = pagination || {};
      fn(p.current, p.pageSize);
    }
  };

  getMaxCurrent(total) {
    const {
      pagination: { current, pageSize }
    } = this.state;
    if ((current - 1) * pageSize >= total) {
      return Math.floor((total - 1) / pageSize) + 1;
    }
    return current;
  }

  getCurrentPageData(data) {
    let current;
    let pageSize;
    const state = this.state;
    // 如果没有分页的话，默认全部展示
    if (!this.hasPagination()) {
      pageSize = data.length;
      current = 1;
    } else {
      pageSize = state.pagination.pageSize;
      current = this.getMaxCurrent(state.pagination.total || data.length);
    }

    // 分页
    // ---
    // 当数据量少于等于每页数量时，直接设置数据
    // 否则进行读取分页数据
    if (data.length > pageSize) {
      data = data.filter((_, i) => {
        return i >= (current - 1) * pageSize && i < current * pageSize;
      });
    }

    return data;
  }

  getData = () => {
    let { data, sortedColumns, groupedColumnKey } = this.state;
    let rowKey = this.props.rowKey;
    let arr = data;

    let orderColumns = [];
    let orderTypes = [];

    if (sortedColumns) {
      Object.keys(sortedColumns).forEach(k => {
        let v = sortedColumns[k];
        if (v !== "none") {
          orderColumns.push(k);
          orderTypes.push(v);
        }
      });
    }

    if (orderColumns.length > 0) {
      arr = orderBy(data, orderColumns, orderTypes);
    }

    if (this.hasPagination()) {
      arr = this.getCurrentPageData(arr);
    }

    if (groupedColumnKey instanceof Array) {
      arr = getGroupedData({
        groupedKey: groupedColumnKey,
        data: arr,
        keyField: rowKey
      });
    }

    return arr;
  };

  onSort = dataIndex => {
    let sorted = this.state.sortedColumns || {};

    let newSorted = {};
    if (this.props.multipleSort) {
      newSorted = { ...sorted };
    }

    let col = sorted[dataIndex];

    let currSort = col || "none";

    let targetSort = {
      none: "asc",
      asc: "desc",
      desc: "none"
    }[currSort];

    col = targetSort;

    if (targetSort === "none") {
      delete newSorted[dataIndex];
    } else {
      newSorted[dataIndex] = targetSort;
    }

    setConfigs(this.props.tableId, {
      sortedColumns: newSorted
    });

    this.setState({ sortedColumns: newSorted }, () => {
      let fn = this.props.onSort;
      if (typeof fn === "function") {
        let { sortedColumns, data } = this.state;
        fn(sortedColumns, { data });
      }
    });
  };

  onTitleClick = ({ dataIndex }) => {
    this.onSort(dataIndex);
  };

  columnSettingMenuShow = e => {
    e.stopPropagation();

    let el = e.currentTarget;

    el.className = "tablex__head__cell__title__dropdown opened";

    let head = getParentElement(el, ".tablex-table-head-container");

    let container = getParentElement(el, ".tablex__container__body");

    let p = getParentElement(el, ".tablex-table-head-cell");

    let containerTop = 0;

    if (container) {
      containerTop = container.offsetTop;
    }

    let sl = 0;
    if (head) {
      sl = head.scrollLeft;
    }

    let left = 0;
    let top = 0;
    if (p) {
      left = p.offsetLeft + p.offsetWidth - sl - el.offsetWidth;
      top =
        containerTop + p.offsetTop + p.offsetHeight - p.offsetHeight / 2 + 6;
    }

    if (this.dropdown_button_ref && this.dropdown_button_ref.current) {
      this.dropdown_button_ref.current.click();
    }

    this.setState({
      columnMenu: {
        columnKey: el.dataset.columnkey,
        trigger: el,
        visible: true,
        offsetX: left,
        offsetY: top
      }
    });
  };

  columnSettingMenuHide = () => {
    let columnMenu = this.state.columnMenu || {};
    if (columnMenu.trigger) {
      columnMenu.trigger.className = "tablex__head__cell__title__dropdown";
    }
    this.setState({
      columnMenu: Object.assign(columnMenu, { visible: false, trigger: null })
    });
  };

  onColumnResize = (width, columnKey) => {
    let w = width;
    if (w <= 0) {
      w = 10;
    }
    this.onColumnChange(columnKey, { width: w });
  };

  onColumnChange = (key, config) => {
    let {
      columnsConfig,
      columnMenu,
      groupedColumnKey: prevGrouped
    } = this.state;

    let columnKey = key;

    let configs = columnsConfig || {};

    if (!columnKey && columnMenu) {
      columnKey = columnMenu.columnKey;
    }

    //分组列配置
    let groupedColumnKey = [];

    if (prevGrouped instanceof Array) {
      groupedColumnKey = prevGrouped.slice();
    }

    if (config.grouped === true) {
      if (groupedColumnKey.indexOf(columnKey) === -1) {
        groupedColumnKey.push(columnKey);
      }
    } else if (config.grouped === false) {
      let gi = groupedColumnKey.indexOf(columnKey);
      if (gi > -1) {
        groupedColumnKey.splice(gi, 1);
      }
    } else if (config.grouped === "none") {
      groupedColumnKey = [];
    }
    //

    let prevConfig = configs[columnKey] || {};
    let nextConfig = {
      [columnKey]: Object.assign({}, prevConfig, config)
    };

    let newConfigs = { ...configs, ...nextConfig };

    setConfigs(this.props.tableId, {
      columnsConfig: newConfigs,
      groupedColumnKey: groupedColumnKey
    });

    this.setState(
      {
        columnsConfig: newConfigs,
        groupedColumnKey: groupedColumnKey
      },
      this.resetScrollbarSize
    );
  };

  formatPrependColumns = columns => {
    let { columnsConfig } = this.state;

    let configs = columnsConfig || {};

    let arr = columns;

    let cols = treeToList(arr).leafs;

    cols.forEach((d, i) => {
      let columnKey = d.key || d.dataIndex;
      let config = configs[columnKey] || configs[columnKey] || {};

      if ("width" in config) {
        d.width = config.width;
      }
    });

    return columns;
  };

  hasDropMenu = () => {
    let o = this.props.columnDropMenuOptions || {};

    let columnDropMenu = this.state.columnDropMenu;
    let hasOptions = false;
    if (o.fixable || o.filterable || o.groupable) {
      hasOptions = true;
    }

    return columnDropMenu && hasOptions;
  };

  formatColumns = columns => {
    let {
      columnsConfig,
      sortedColumns,
      sortable,
      groupedColumnKey
    } = this.state;

    let configs = columnsConfig || {};

    let arr = [];
    let maxDepth = 0;
    let needSortColumn = false;

    arr = treeFilter(cloneDeep(columns), (d, i, { depth }) => {
      let columnKey = d.key || d.dataIndex;
      let bl = true;

      let config = configs[columnKey] || {};

      if (depth > maxDepth) {
        maxDepth = depth;
      }

      if ("hidden" in config) {
        bl = !config.hidden;
      } else {
        bl = !d.hidden;
      }

      if (typeof config.order === "number") {
        needSortColumn = true;
        d.__order = config.order;
      } else {
        d.__order = i;
      }

      return bl;
    });

    if (needSortColumn) {
      arr = orderBy(arr, ["__order"], ["asc"]);
    }

    let cols = treeToList(arr).leafs;

    //分组列渲染
    let firstLeftColumn = null;
    let firstMiddleColumn = null;
    let firstRightColumn = null;
    let leftColumnsCount = 0;
    let rightColumnsCount = 0;
    let middleColumnsCount = 0;
    let hasGroupColumn = false;
    if (groupedColumnKey instanceof Array && groupedColumnKey.length > 0) {
      hasGroupColumn = true;
    }
    let groupColumnName = {};

    let table_hasDropMenu = this.hasDropMenu();

    cols.forEach(d => {
      let columnKey = d.key || d.dataIndex;
      let config = configs[columnKey] || {};
      let hasDropMenu = table_hasDropMenu;
      if (typeof d.dropMenu === "boolean") {
        hasDropMenu = d.dropMenu;
      }

      let allowSort = sortable;
      if (typeof d.sortable === "boolean") {
        allowSort = d.sortable;
      }

      let sort = (sortedColumns || {})[d.dataIndex];

      if ("fixed" in config) {
        d.fixed = config.fixed;
      }

      if ("width" in config) {
        if (maxDepth > 0 && !config.width) {
          d.width = DEFAULT_COLUMN_WIDTH;
        } else {
          d.width = config.width;
        }
      }

      if ("order" in config) {
        d.__order = config.order;
        needSortColumn = true;
      }

      //查出首列，以控制数据分组时的列合并
      if (d.fixed === "left") {
        leftColumnsCount += 1;
        firstLeftColumn === null && (firstLeftColumn = d);
      } else if (d.fixed === "right") {
        rightColumnsCount += 1;
        firstRightColumn === null && (firstRightColumn = d);
      } else {
        middleColumnsCount += 1;
        firstMiddleColumn === null && (firstMiddleColumn = d);
      }

      if (typeof d.title === "string" || typeof d.title === "number") {
        groupColumnName[columnKey] = d.title;
      }
      //

      let titleCellAttr = {};

      if (allowSort) {
        titleCellAttr.onClick = () => {
          this.onTitleClick(d);
        };
      }

      d.headCellRender = ({ title }) => {
        return (
          <div className="tablex__head__cell__title" {...titleCellAttr}>
            {title}
            {allowSort ? <SortIcon order={sort} /> : null}
            {hasDropMenu === true ? (
              <ColumnDropMenuButton
                data-columnkey={columnKey}
                onClick={this.columnSettingMenuShow}
              />
            ) : null}
          </div>
        );
      };
    });

    //数据分组的首行，进行相应的列合并
    let firstColumn = firstLeftColumn || firstMiddleColumn || firstRightColumn;

    if (hasGroupColumn && firstColumn) {
      firstColumn.align = "left";
      let oldRender = firstColumn.render;

      firstColumn.render = (value, row, index, extra) => {
        if (row && row.__isGroupedHeadRow) {
          let groupLable = groupColumnName[row.__groupColumnKey] || "";
          if (groupLable) {
            groupLable += ":";
          }
          const obj = {
            children: (
              <span>
                <label style={{ fontWeight: "bold" }}>{groupLable}</label>
                {row.__groupName || ""}
                <label style={{ fontWeight: "bold" }}>({row.__count})</label>
                {this.getColumnGroupSummary(row.children || [])}
              </span>
            ),
            props: {
              colSpan: cols.length - leftColumnsCount - rightColumnsCount + 1
            }
          };
          return obj;
        } else {
          let firstColumnValue = value;

          if (typeof oldRender === "function") {
            firstColumnValue = oldRender(value, row, index, extra);
          }
          return firstColumnValue;
        }
      };

      if (firstMiddleColumn && firstColumn !== firstMiddleColumn) {
        let renderFn = firstMiddleColumn.render;

        firstMiddleColumn.render = (value, row, index, extra) => {
          if (row && row.__isGroupedHeadRow) {
            return {
              props: {
                colSpan: middleColumnsCount
              },
              children: null
            };
          } else {
            let val = value;
            if (typeof renderFn === "function") {
              val = renderFn && renderFn(value, row, index, extra);
            }
            return val;
          }
        };
      }

      if (firstRightColumn && firstColumn !== firstRightColumn) {
        let renderFn = firstRightColumn.render;

        firstRightColumn.render = (value, row, index, extra) => {
          if (row && row.__isGroupedHeadRow) {
            return {
              props: {
                colSpan: rightColumnsCount
              },
              children: null
            };
          } else {
            let val = value;
            if (typeof renderFn === "function") {
              val = renderFn && renderFn(value, row, index, extra);
            }
            return val;
          }
        };
      }
    }
    //

    return arr;
  };

  saveConfig = configs => {
    this.setState({ columnsConfig: configs }, this.resetScrollbarSize);
  };

  resetConfig = () => {
    this.setState(
      {
        columnsConfig: {},
        groupedColumnKey: this.props.defaultGroupedColumnKey,
        sortedColumns: []
      },
      this.resetScrollbarSize
    );
  };

  renderHeader = () => {
    let header = null;
    let toolsBar = null;
    let headerEl = null;

    if (typeof this.props.header === "function") {
      headerEl = this.props.header();
    }

    if (typeof this.props.headerToolsBar === "function") {
      toolsBar = this.props.headerToolsBar();
    }

    if (headerEl !== null || toolsBar != null) {
      header = (
        <div className="tablex__container__header">
          {headerEl}
          {toolsBar}
        </div>
      );
    }

    return {
      header
    };
  };

  renderFooter = () => {
    let { pagination: pageAttr, data } = this.state;

    let { settable, tableId, showRefresh } = this.props;

    let footer = null;

    let footerExtraEl = null;
    let footerContentEl = null;

    let footerEl = null;
    let toolsBarEl = null;
    let pagerEl = null;
    let settingButtonEl = null;
    let refreshButtonEl = null;

    if (typeof this.props.footer === "function") {
      footerEl = this.props.footer();
    }

    if (typeof this.props.footerToolsBar === "function") {
      toolsBarEl = this.props.footerToolsBar();
    }

    if (typeof this.props.footerExtra === "function") {
      let footerExtra = this.props.footerExtra();
      if (footerExtra !== null) {
        footerExtraEl = (
          <div className="tablex__container__footer__extra">{footerExtra}</div>
        );
      }
    }

    let dataTotal = pageAttr.total;
    if (data.length === 0) {
      dataTotal = 0;
    }

    let hasPager = this.hasPagination();

    if (settable === true && tableId) {
      settingButtonEl = (
        <div key="_settingButton" className="table-tools-item">
          <Setting
            tableId={tableId}
            onSave={this.saveConfig}
            onReset={this.resetConfig}
            configs={this.state.columnsConfig}
            columns={this.state.rawColumns}
            intl={this.props.intl}
          />
        </div>
      );
    }

    if (hasPager) {
      pagerEl = (
        <Pagination
          {...pageAttr}
          total={dataTotal}
          intl={this.props.intl}
          showRefresh={showRefresh}
          onRefresh={this.onRefresh}
          onPageChange={this.onPageChange}
          onShowSizeChange={this.onShowSizeChange}
        />
      );
    } else {
      if (showRefresh) {
        refreshButtonEl = (
          <Button
            className="tablex-pagination-refresh table-tools-item"
            icon="reload"
            onClick={this.onRefresh}
          />
        );
      }
    }

    if (
      pagerEl !== null ||
      settingButtonEl !== null ||
      footerEl !== null ||
      toolsBarEl !== null ||
      refreshButtonEl !== null
    ) {
      footerContentEl = (
        <div className="tablex__container__footer__content">
          {settingButtonEl}
          {footerEl}
          {toolsBarEl}
          {refreshButtonEl}
          {pagerEl}
        </div>
      );
    }

    if (footerContentEl !== null || footerExtraEl !== null) {
      footer = (
        <div className="tablex__container__footer">
          {footerExtraEl}
          {footerContentEl}
        </div>
      );
    }

    return { footer };
  };

  loadingRender = ({ headerHeight }) => {
    if (typeof this.props.loadingRender === "function") {
      return this.props.loadingRender({ headerHeight });
    }

    return (
      <div
        className="tablex__overlay"
        style={{
          top: headerHeight
        }}
      >
        <div className="tablex__overlay__inner">
          <Spin
            spinning={true}
            tip={this.props.intl.dataLoading}
            style={{
              margin: "auto",
              transform: "translateY(-50%)"
            }}
          />
        </div>
      </div>
    );
  };
  emptyRenderer = ({ headerHeight }) => {
    if (typeof this.props.emptyRenderer === "function") {
      return this.props.emptyRenderer({ headerHeight });
    }

    return (
      <div
        className="tablex__overlay"
        style={{
          top: headerHeight
        }}
      >
        <div className="tablex__overlay__inner">
          <div className="tablex__emptydata">
            <div className="tablex__emptydata__inner">
              <EmptyIcon />
              {this.props.intl.noDataMsg}
            </div>
          </div>
        </div>
      </div>
    );
  };

  rowClassName = (rowData, rowIndex) => {
    let clsArr = [];
    if (rowIndex % 2 === 0) {
      clsArr = ["tablex__row--even"];
    } else {
      clsArr = ["tablex__row--odd"];
    }

    let fn = this.props.rowClassName;
    if (typeof fn === "function") {
      let cls = fn(rowData, rowIndex);
      if (cls) {
        clsArr.push(cls);
      }
    }

    return clsArr.join(" ");
  };

  innerTableRef = null;
  innerRef = ins => {
    this.innerTableRef = ins;
    if (typeof this.props.innerRef === "function") {
      this.props.innerRef(ins);
    }
  };

  resetScrollbarSize() {
    this.innerTableRef && this.innerTableRef.resetScrollbarSize();
  }

  scrollToFirst() {
    this.innerTableRef && this.innerTableRef.scrollTo(0);
  }

  getColumnGroupSummary = (data = []) => {
    let { style: wrapperStyle, className, data: summaryTypes = [], render } =
      this.props.groupedColumnSummary || {};

    let flatData = treeToList(data).list;

    let arr = [];

    summaryTypes.forEach((d, i) => {
      let { dataIndex, title, type, style: itemStyle } = d;

      let itemStyles = itemStyle || { marginLeft: 10 };

      let fn = summaryMath[type];

      let summaryValue = "";

      if (typeof fn === "function") {
        summaryValue = fn(flatData, dataIndex);
        if (typeof summaryValue === "undefined") {
          summaryValue = "";
        }
      }

      let v = title + ":" + summaryValue;

      if (typeof render === "function") {
        let renderElement = render(v, summaryValue, {
          dataIndex,
          title,
          type
        });
        if (renderElement === null) {
          v = null;
        } else if (renderElement !== undefined) {
          v = renderElement;
        }
      }

      arr.push(
        <span style={itemStyles} key={type + "-" + i}>
          {v}
        </span>
      );
    });

    if (arr.length > 0) {
      return (
        <span className={className} style={wrapperStyle}>
          {arr}
        </span>
      );
    } else {
      return null;
    }
  };

  getSummary = () => {
    let { summary = {} } = this.props;

    let {
      data: summaryTypes = [],
      title = {},
      render,
      style = {},
      custom = false
    } = summary;

    //title所在列
    let titleColumn = title.column || "";
    //title自定义渲染
    let titleRender = title.render;
    //title显示文本
    let titleText = title.text || "";

    let arr = [];

    //如果为完全自定义，则不执行自身逻辑
    if (custom) {
      summaryTypes.forEach((s, i) => {
        let r = {
          key: "summary_" + i
        };

        for (const k in s) {
          let dataIndex = k;
          let type = s[k];
          let summaryValue = "";
          let v = summaryValue;
          if (typeof render === "function") {
            v = render(summaryValue, k, type, i);
            if (typeof v === "undefined" || v === null) {
              v = "";
            }
          }
          r[dataIndex] = v;
        }

        if (titleColumn) {
          r[titleColumn] = titleText;
          if (typeof titleRender === "function") {
            r[titleColumn] = titleRender(s, i);
          }
        }

        arr.push(r);
      });
    } else {
      let { data } = this.state;

      let flatData = treeToList(data).list;

      summaryTypes.forEach((s, i) => {
        let r = {
          key: "summary_" + i
        };

        for (const k in s) {
          let dataIndex = k;
          let type = s[k];

          let fn = summaryMath[type];

          let summaryValue = "";

          if (typeof fn === "function") {
            summaryValue = fn(flatData, dataIndex);
            if (typeof summaryValue === "undefined") {
              summaryValue = "";
            }
          }

          let v = summaryValue;

          if (typeof render === "function") {
            v = render(summaryValue, k, type, i);
            if (typeof v === "undefined" || v === null) {
              v = "";
            }
          }

          r[dataIndex] = v;
        }

        if (titleColumn) {
          r[titleColumn] = titleText;
          if (typeof titleRender === "function") {
            r[titleColumn] = titleRender(s, i);
          }
        }

        arr.push(r);
      });
    }

    let frozenRender = {
      rowHeight: 40,
      rowKey: "key",
      bottom: arr,
      onCell: (row, rowIndex, { columnKey }) => {
        let styles = Object.assign({}, style);
        if (
          columnKey === "__checkbox_column" ||
          columnKey === "__ordernumber_column"
        ) {
          styles.border = "none";
        }

        return { style: styles };
      }
    };

    return frozenRender;
  };

  showContextMenu = ({ left, top, data }) => {
    this.contextmenu_ref.current.show({ left, top, data });
  };

  onRow = (rowData, rowIndex, extra) => {
    let fn = this.props.onRow;

    let o = {};
    if (typeof fn === "function") {
      o = fn(rowData, rowIndex, extra) || {};
    }

    return {
      ...o,
      onContextMenu: e => {
        let bl = true;
        if (typeof o.onContextMenu === "function") {
          bl = o.onContextMenu(e);
        }
        if (bl !== false) {
          e.preventDefault();
          e.stopPropagation();
          this.showContextMenu({
            left: e.clientX,
            top: e.clientY,
            data: rowData
          });
        }
      }
    };
  };

  render() {
    let props = this.props;

    let {
      columnMenu,
      columns: tableColumns,
      prependColumns: tablePrependColumns
    } = this.state;

    let hasDropMenu = this.hasDropMenu();

    let columns = this.formatColumns(tableColumns);
    let prependColumns = this.formatPrependColumns(tablePrependColumns);
    let settableColumns = tableColumns.filter(d => d.settable !== false);

    let arr = this.getData();

    let newProps = {
      data: arr,
      columns,
      prependColumns,
      onColumnResizeStop: this.onColumnResize,
      innerRef: this.innerRef,
      style: {}
    };

    if (typeof props.contextMenu === "function") {
      newProps.onRow = this.onRow;
    }

    if (props.summary) {
      newProps.frozenRender = this.getSummary();
    }

    if (props.striped === true) {
      newProps.rowClassName = this.rowClassName;
      newProps.className = "tablex__striped";
    }

    if (this.props.loading === true) {
      newProps.overlayRenderer = this.loadingRender;
    } else {
      if (arr.length === 0) {
        newProps.overlayRenderer = this.emptyRenderer;
      }
    }
    let columnMenuState = columnMenu || {};

    let { footer } = this.renderFooter();
    let { header } = this.renderHeader();

    let classNames = ["tablex__container"];

    if (props.className) {
      classNames.push(props.className);
    }

    classNames = classNames.join(" ");

    let bodyStyles = {};
    let wrapperStyles = Object.assign(
      {
        height: "100%"
      },
      props.style || {}
    );

    if (props.autoHeight === true) {
      bodyStyles.height = "auto";
      wrapperStyles.height = "auto";
    }

    return (
      <div className={classNames} style={wrapperStyles}>
        {header}
        <div className="tablex__container__body" style={bodyStyles}>
          <BaseTable {...props} {...newProps} />
        </div>
        {footer}

        {hasDropMenu === true ? (
          <Popover
            trigger="click"
            onVisibleChange={this.columnSettingMenuHide}
            content={
              <ColumnDropMenu
                options={props.columnDropMenuOptions}
                columns={settableColumns}
                columnsConfig={this.state.columnsConfig}
                onChange={this.onColumnChange}
                intl={this.props.intl}
              />
            }
            arrowPointAtCenter={true}
            placement="bottomRight"
          >
            <span
              style={{
                width: 1,
                height: 1,
                position: "absolute",
                left: columnMenuState.offsetX,
                top: columnMenuState.offsetY,
                display: columnMenuState.visible ? "block" : "none"
              }}
              ref={this.dropdown_button_ref}
            />
          </Popover>
        ) : null}

        {typeof props.contextMenu === "function" ? (
          <ContextMenu
            ref={this.contextmenu_ref}
            wrapperStyle={props.contextMenuWrapperStyle}
            style={props.contextMenuStyle}
            content={props.contextMenu}
          ></ContextMenu>
        ) : null}
      </div>
    );
  }
}

Table.defaultProps = {
  orderNumber: true,
  sortable: true,
  settable: true,
  columnDropMenu: true,
  columnDropMenuOptions: {
    fixable: true,
    filterable: true,
    groupable: true
  },
  pagination: false,
  showRefresh: false,
  resetScrollOffset: true,
  loading: false,
  striped: true,
  contextMenuWrapperStyle: {},
  contextMenuStyle: {},
  defaultGroupedColumnKey: [],
  multipleSort: true,
  memorizeSortedColumns: false,
  memorizePageSize: false,
  intl: {
    orderNumberTitle: "序号",
    dataLoading: "数据加载中，请稍候...",
    noDataMsg: "暂无数据",
    totalInfo: "显示 {0}-{1}，共 {2} 条",

    settingTitle: "表格配置",
    settingReset: "重置",
    settingOk: "确定",
    settingCancel: "取消",
    settingWidth: "宽度：",
    settingFixed: "冻结：",
    settingFixedLeft: "左",
    settingFixedNone: "无",
    settingFixedRight: "右",
    settingVisible: "显示",
    settingHidden: "隐藏",

    columnMenuFixed: "列冻结",
    columnMenuFixedLeft: "左侧",
    columnMenuFixedRight: "右侧",
    columnMenuFixedReset: "取消冻结",
    columnMenuVisible: "显示/隐藏",
    columnMenuGroup: "列分组",
    columnMenuGroupAdd: "添加此列",
    columnMenuGroupRemove: "取消此列",
    columnMenuGroupReset: "重置所有"
  }
};

Table.propTypes = {
  /** 数据是否加载中 */
  loading: PropTypes.bool,

  /** 是否显示序号 */
  orderNumber: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 行右键菜单渲染 */
  contextMenu: PropTypes.func,

  /** 右键菜单外层样式 */
  contextMenuWrapperStyle: PropTypes.object,

  /** 右键菜单样式 */
  contextMenuStyle: PropTypes.object,

  /** 分页 */
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 是否显示底部刷新按钮 */
  showRefresh: PropTypes.bool,

  /** 刷新按钮事件 */
  onRefresh: PropTypes.func,

  /** 分页发生改变后是否重置滚动条位置 */
  resetScrollOffset: PropTypes.bool,

  /** 是否启用列标题配置项菜单 */
  columnDropMenu: PropTypes.bool,

  /** 列下拉配置项 */
  columnDropMenuOptions: PropTypes.shape({
    fixable: PropTypes.bool,
    filterable: PropTypes.bool,
    groupable: PropTypes.bool
  }),

  /** 是否可进行列排序 */
  sortable: PropTypes.bool,

  /** 是否多列排序 */
  multipleSort: PropTypes.bool,

  /** 排序事件 */
  onSort: PropTypes.func,

  /** 是否可进行属性配置 */
  settable: PropTypes.bool,

  /** 根据此列进行数据分组 */
  groupedColumnKey: PropTypes.array,

  /** 数据分组列汇总 */
  groupedColumnSummary: PropTypes.shape({
    style: PropTypes.object,
    className: PropTypes.string,
    data: PropTypes.array,
    render: PropTypes.func
  }),

  /** 默认分组列 */
  defaultGroupedColumnKey: PropTypes.array,

  /** 奇偶行颜色间隔 */
  striped: PropTypes.bool,

  /** 渲染footer */
  footer: PropTypes.func,

  /** 渲染额外footer，独占一行 */
  footerExtra: PropTypes.func,

  /** loading层自定义render */
  loadingRender: PropTypes.func,

  /** 无数据时的自定义render */
  emptyRenderer: PropTypes.func,

  /** 渲染header */
  header: PropTypes.func,

  /** 汇总信息渲染 */
  summary: PropTypes.shape({
    style: PropTypes.object,
    title: PropTypes.object,
    data: PropTypes.array,
    render: PropTypes.func
  }),

  /** actions注册 */
  actions: PropTypes.object,

  /** 是否记忆排序列 */
  memorizeSortedColumns: PropTypes.bool,
  /** 是否记忆pageSize */
  memorizePageSize: PropTypes.bool,
  /** 表格加载完成时的回调，如果启用了分页会传递pageIndex、pageSize */
  onMount: PropTypes.func,

  /** 表格全局id，通过此id记忆表格配置，由于采用localStorage存储配置，需保证id唯一 */
  tableId: function(props, propName, componentName) {
    let count = 0;
    let v = props[propName];

    if (typeof v !== "undefined" && v !== "") {
      let tbs = document.getElementsByClassName("table-extend");

      for (let i = 0, len = tbs.length; i < len; i++) {
        const tb = tbs[i];
        if (tb) {
          const t = tb.getAttribute("data-tableid");
          if (t === v) {
            count = count + 1;

            if (count > 1) {
              break;
            }
          }
        }
      }
    }

    if (count > 1) {
      return new Error(
        ` Encountered two table with the same tableId, '${v}'.The tableId must be unique in the whole application.
                  We Recommended set the tableId based on file path.
                  eg: platform/user/index.js =>  platform-user-xxx `
      );
    }
  }
};

export default Table;
