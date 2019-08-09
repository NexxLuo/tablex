import React from "react";
import PropTypes from "prop-types";
import Table from "react-base-datagrid";

import Pagination from "./pagination";
import Spin from "antd/lib/spin";
import ColumnDropMenu, { ColumnDropMenuButton } from "./ColumnDropMenu";
import {
  treeToFlatten as treeToList,
  treeFilter,
  getParentElement
} from "./utils";
import Setting, { getConfigs, setConfigs } from "./setting";
import orderBy from "lodash/orderBy";
import Popover from "antd/lib/popover";
import cloneDeep from "lodash/cloneDeep";
import SortIcon from "./SortIndicator";

function orderNumberCellRender(value, rowData, index) {
  return index + 1;
}

function orderNumberHeadRender() {
  return "序号";
}

/**
 * 表格
 */
class FeaturedTable extends React.Component {
  dropdown_button_ref = React.createRef();

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

      nextState = {
        columns: cloneDeep(columns),
        data: data,
        rawData: data,
        rawColumns: columns,
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
            dataKey: "__ordernumber_column",
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
      () => {
        this.resetScrollbarSize();
      }
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

    let arr = columns;

    arr = treeFilter(columns, d => {
      let columnKey = d.key || d.dataIndex;
      let bl = true;

      d.key = columnKey;
      let config = configs[columnKey] || {};

      if ("hidden" in config) {
        bl = !config.hidden;
      } else {
        bl = !d.hidden;
      }

      return bl;
    });

    let cols = treeToList(arr).leafs;
    let needSortColumn = false;

    cols.forEach((d, i) => {
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
        d.width = config.width;
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
    this.setState({ columnsConfig: configs });
  };

  resetConfig = () => {
    this.setState({ columnsConfig: {} });
  };

  renderHeader = () => {
    let header = null;

    let headerExtra = null;
    let headerEl = null;

    if (typeof this.props.header === "function") {
      headerEl = this.props.header();
    }

    if (typeof this.props.headerExtra === "function") {
      headerExtra = this.props.headerExtra();
    }

    if (headerEl !== null || headerExtra != null) {
      header = (
        <div className="tablex__container__header">
          {headerEl}
          {headerExtra}
        </div>
      );
    }

    return header;
  };

  renderFooter = () => {
    let footer = null;

    let { pagination: pageAttr, data } = this.state;

    let { settable, tableId } = this.props;

    let footerExtra = null;
    let footerEl = null;

    if (typeof this.props.footer === "function") {
      footerEl = this.props.footer();
    }

    if (typeof this.props.footerExtra === "function") {
      footerExtra = this.props.footerExtra();
    }

    const dataTotal = pageAttr.total || data.length;

    let hasPager = this.hasPagination();

    let pager = null;
    let settingButton = null;

    if (settable === true && tableId) {
      settingButton = (
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
      pager = (
        <Pagination
          {...pageAttr}
          total={dataTotal}
          onPageChange={this.onPageChange}
        />
      );
    }

    if (
      pager !== null ||
      settingButton !== null ||
      footerEl !== null ||
      footerExtra !== null
    ) {
      footer = (
        <div className="tablex__container__footer">
          {settingButton}
          {footerEl}
          {footerExtra}
          {pager}
        </div>
      );
    }

    return footer;
  };

  overlayRenderer = () => {
    return (
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
          zIndex: 2
        }}
      />
    );
  };
  emptyRenderer = () => {
    return <div className="tablex__emptydata">暂无数据</div>;
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
      emptyRenderer: this.emptyRenderer,
      innerRef: this.innerRef
    };

    if (props.striped === true) {
      newProps.rowClassName = this.rowClassName;
      newProps.className = "tablex__striped";
    }

    if (this.props.loading === true) {
      newProps.overlayRenderer = this.overlayRenderer;
    }

    let columnMenuState = columnMenu || {};

    let footer = this.renderFooter();
    let header = this.renderHeader();

    let extraHeight = 0;

    let bodyStyles = {};
    if (footer) {
      extraHeight += 50;
    }
    if (header) {
      extraHeight += 50;
    }

    if (extraHeight > 0) {
      bodyStyles.height = `calc(100% - ${extraHeight}px)`;
    }

    let wrapperStyles = Object.assign({}, props.style || {});

    if (props.minHeight) {
      wrapperStyles.minHeight = props.minHeight + extraHeight;
    }

    return (
      <div className="tablex__container" style={wrapperStyles}>
        {header}
        <div className="tablex__container__body" style={bodyStyles}>
          <Table {...props} {...newProps} />
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
      </div>
    );
  }
}

FeaturedTable.defaultProps = {
  orderNumber: true,
  settable: true,
  columnDropMenu: true,
  pagination: false,
  loading: false,
  striped: true,
  minHeight: 200
};

FeaturedTable.propTypes = {
  /** 表格区域最小高度 */
  minHeight: PropTypes.number,

  /** 数据是否加载中 */
  loading: PropTypes.bool,

  /** 是否显示序号 */
  orderNumber: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 分页 */
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 是否启用列标题配置项菜单 */
  columnDropMenu: PropTypes.bool,

  /** 是否可进行属性配置 */
  settable: PropTypes.bool,

  /** 奇偶行颜色间隔 */
  striped: PropTypes.bool,

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

export default FeaturedTable;
