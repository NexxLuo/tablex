import React from "react";
import PropTypes from "prop-types";
import BaseTable from "react-base-datagrid";
import ContextMenu from "./components/ContextMenu";
import Pagination from "./components/pagination";
import ColumnDropMenu from "./components/ColumnDropMenu";
import Setting, { getConfigs, setConfigs } from "./components/setting";
import SortIcon from "./components/SortIndicator";
import EmptyIcon from "./components/EmptyIcon";
import Spin from "antd/lib/spin";
import {
  treeToFlatten as treeToList,
  treeFilter,
  getParentElement
} from "./utils";
import orderBy from "lodash/orderBy";
import Popover from "antd/lib/popover";
import cloneDeep from "lodash/cloneDeep";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import sumBy from "lodash/sumBy";


const DEFAULT_COLUMN_WIDTH = 100;

function orderNumberCellRender(value, rowData, index) {
  return index + 1;
}

function orderNumberHeadRender() {
  return "序号";
}

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

/**
 * 表格
 */
class Table extends React.Component {
  dropdown_button_ref = React.createRef();
  contextmenu_ref = React.createRef();

  constructor(props) {
    super(props);

    let configs = {};

    if (props.tableId) {
      configs = getConfigs(props.tableId) || {};
    }

    this.state = {
      prevProps: null,
      pagination: false,
      data: [],
      rawData: [],
      columns: [],
      columnDropMenu: false,
      columnsConfig: configs.columnsConfig || null,
      sortedColumns: null,
      columnMenu: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let { columns, prependColumns = [], columnDropMenu } = nextProps;

      let data = nextProps.data || nextProps.dataSource || [];

      //给列key、width设置缺省值
      let columnsArr = treeFilter(columns, (d, i, { depth, treeIndex }) => {
        if (!d.key) {
          d.key = depth + "-" + i + "-" + treeIndex;
        }

        if (depth > 0) {
          d.width = d.width || DEFAULT_COLUMN_WIDTH;
        }

        return true;
      });

      nextState = {
        columns: cloneDeep(columnsArr),
        data: data,
        rawData: data,
        rawColumns: columnsArr,
        columnDropMenu,
        prevProps: nextProps
      };

      let extraColumns = [];

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
            title: orderNumberHeadRender
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

      nextState.prependColumns = extraColumns.concat(prependColumns);
    }

    if ("pagination" in nextProps) {
      nextState.pagination = nextProps.pagination;

      const newPagination = {
        ...prevState.pagination,
        ...nextProps.pagination
      };
      newPagination.current = newPagination.current || 1;
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

  hasPagination() {
    return this.props.pagination !== false;
  }

  onPageChange = (pageIndex, pageSize) => {
    let { pagination } = this.state;
    let fn = this.state.pagination.onPageChange;

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
    let { data, sortedColumns } = this.state;
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

    return arr;
  };

  onSort = dataIndex => {
    let sorted = this.state.sortedColumns || {};

    let newSorted = { ...sorted };

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

    this.setState({ sortedColumns: newSorted });
  };

  onTitleClick = ({ dataIndex }) => {
    this.onSort(dataIndex);
  };

  columnSettingMenuShow = e => {
    e.stopPropagation();

    e.target.className = "tablex__head__cell__title__dropdown opened";

    let el = e.target;

    let head = getParentElement(el, ".tablex-table-head-container");

    let container = getParentElement(el, ".tablex__container__body");

    let p = getParentElement(e.target, ".tablex-table-head-cell");

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
        columnKey: e.target.dataset.columnkey,
        trigger: e.target,
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
    this.onColumnChange(columnKey, { width });
  };

  onColumnChange = (key, config) => {
    let columnKey = key;

    let { columnsConfig, columnMenu } = this.state;

    let configs = columnsConfig || {};

    if (!columnKey && columnMenu) {
      columnKey = columnMenu.columnKey;
    }

    let prevConfig = configs[columnKey] || {};
    let nextConfig = {
      [columnKey]: Object.assign({}, prevConfig, config)
    };

    let newConfigs = { ...configs, ...nextConfig };

    setConfigs(this.props.tableId, {
      columnsConfig: newConfigs,
      groupedColumnKey: null
    });

    this.setState(
      {
        columnsConfig: newConfigs
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

  formatColumns = columns => {
    let { columnsConfig, columnDropMenu, sortedColumns } = this.state;

    let configs = columnsConfig || {};

    let arr = [];
    let maxDepth = 0;

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

      return bl;
    });

    let cols = treeToList(arr).leafs;
    let needSortColumn = false;

    cols.forEach(d => {
      let columnKey = d.key || d.dataIndex;
      let config = configs[columnKey] || configs[columnKey] || {};
      let dropMenu = columnDropMenu;
      if (d.dropMenu === false) {
        dropMenu = false;
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

      d.headCellRender = ({ title }) => {
        return (
          <div
            className="tablex__head__cell__title"
            onClick={() => this.onTitleClick(d)}
          >
            {title}
            <SortIcon order={sort} />
            {dropMenu === true ? (
              <span
                className="tablex__head__cell__title__dropdown"
                data-columnkey={columnKey}
                onClick={this.columnSettingMenuShow}
              />
            ) : null}
          </div>
        );
      };
    });

    if (needSortColumn) {
      arr = orderBy(arr, ["__order"], ["asc"]);
    }

    return arr;
  };

  saveConfig = configs => {
    this.setState({ columnsConfig: configs }, this.resetScrollbarSize);
  };

  resetConfig = () => {
    this.setState({ columnsConfig: {} }, this.resetScrollbarSize);
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
        <div className="tablex__container__header" style={{ height: 40 }}>
          {headerEl}
          {toolsBar}
        </div>
      );
    }

    return {
      header,
      height: 40
    };
  };

  renderFooter = () => {
    let { pagination: pageAttr, data } = this.state;

    let { settable, tableId } = this.props;

    let footer = null;
    let footerHeight = 0;

    let footerExtraEl = null;
    let footerContentEl = null;

    let footerEl = null;
    let toolsBarEl = null;
    let pagerEl = null;
    let settingButtonEl = null;

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
        footerHeight += 50;
      }
    }

    const dataTotal = pageAttr.total || data.length;

    let hasPager = this.hasPagination();

    if (settable === true && tableId) {
      settingButtonEl = (
        <div key="_settingButton" style={{ marginRight: "5px" }}>
          <Setting
            tableId={tableId}
            onSave={this.saveConfig}
            onReset={this.resetConfig}
            configs={this.state.columnsConfig}
            columns={this.state.rawColumns}
          />
        </div>
      );
    }

    if (hasPager) {
      pagerEl = (
        <Pagination
          {...pageAttr}
          total={dataTotal}
          onPageChange={this.onPageChange}
        />
      );
    }

    if (
      pagerEl !== null ||
      settingButtonEl !== null ||
      footerEl !== null ||
      toolsBarEl !== null
    ) {
      footerHeight += 50;
      footerContentEl = (
        <div className="tablex__container__footer__content">
          {settingButtonEl}
          {footerEl}
          {toolsBarEl}
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

    return { footer, height: footerHeight };
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
        <Spin
          spinning={true}
          tip="数据加载中，请稍候..."
          style={{
            position: "absolute",
            margin: "auto",
            left: 0,
            right: 0,
            width: 300,
            height: 50,
            top: 0,
            bottom: 0,
            zIndex: 3
          }}
        />
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
        <div className="tablex__emptydata">
          <EmptyIcon />
          暂无数据
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

  getSummary = () => {
    let { summary = {} } = this.props;
    let { data } = this.state;

    let flatData = treeToList(data).list;

    let { data: summaryTypes = [], title = {}, render, style = {} } = summary;

    let titleColumn = title.column || "";
    let titleRender = title.render;
    let titleText = title.text || "";

    let arr = [];

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
            summaryValue = "";
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
      prependColumns: tablePrependColumns,
      columnDropMenu
    } = this.state;

    let columns = this.formatColumns(tableColumns);
    let prependColumns = this.formatPrependColumns(tablePrependColumns);
    let settableColumns = tableColumns.filter(d => d.settable !== false);

    let arr = this.getData();

    let newProps = {
      data: arr,
      columns,
      prependColumns,
      onColumnResizeStop: this.onColumnResize,
      innerRef: this.innerRef
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

    let { footer, height: footerHeight } = this.renderFooter();
    let { header, height: headerHeight } = this.renderHeader();

    let extraHeight = 0;

    let bodyStyles = { height: "100%" };
    if (footer) {
      extraHeight += footerHeight;
    }
    if (header) {
      extraHeight += headerHeight;
    }

    if (extraHeight > 0) {
      bodyStyles.height = `calc(100% - ${extraHeight}px)`;
    }

    let wrapperStyles = Object.assign({}, props.style || {});

    if (props.minHeight) {
      wrapperStyles.minHeight = props.minHeight + extraHeight;
    }

    let classNames = ["tablex__container"];

    if (props.className) {
      classNames.push(props.className);
    }

    classNames = classNames.join(" ");

    return (
      <div className={classNames} style={wrapperStyles}>
        {header}
        <div className="tablex__container__body" style={bodyStyles}>
          <BaseTable {...props} {...newProps} />
        </div>
        {footer}

        {columnDropMenu === true ? (
          <Popover
            trigger="click"
            onVisibleChange={this.columnSettingMenuHide}
            content={
              <ColumnDropMenu
                options={{ pinable: true, filterable: true, groupable: false }}
                columns={settableColumns}
                columnsConfig={this.state.columnsConfig}
                onChange={this.onColumnChange}
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

        <ContextMenu
          ref={this.contextmenu_ref}
          content={props.contextMenu}
        ></ContextMenu>
      </div>
    );
  }
}

Table.defaultProps = {
  orderNumber: true,
  settable: true,
  columnDropMenu: true,
  pagination: false,
  loading: false,
  striped: true,
  minHeight: 200
};

Table.propTypes = {
  /** 表格区域最小高度 */
  minHeight: PropTypes.number,

  /** 数据是否加载中 */
  loading: PropTypes.bool,

  /** 是否显示序号 */
  orderNumber: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 行右键菜单渲染 */
  contextMenu: PropTypes.func,

  /** 分页 */
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 是否启用列标题配置项菜单 */
  columnDropMenu: PropTypes.bool,

  /** 是否可进行属性配置 */
  settable: PropTypes.bool,

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
