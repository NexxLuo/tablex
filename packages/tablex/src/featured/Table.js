import React from "react";
import PropTypes from "prop-types";
import Table from "react-base-datagrid";

import Pagination from "./pagination";
import Spin from "antd/lib/spin";
import ColumnDropMenu from "./ColumnDropMenu";
import {
  treeToFlatten as treeToList,
  treeFilter,
  getParentElement
} from "./utils";
import Setting, { getConfigs, setConfigs } from "./setting";
import orderBy from "lodash/orderBy";
import Popover from "antd/lib/popover";
import cloneDeep from "lodash/cloneDeep";

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
      columns: [],
      columnsConfig: configs.columnsConfig || null,
      columnMenu: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let columns = cloneDeep(nextProps.columns || []);
      nextState.columns = columns;
      nextState.data = nextProps.data || nextProps.dataSource || [];
      nextState.rawColumns = nextProps.columns || [];
      nextState.prevProps = nextProps;
    }

    if ("pagination" in nextProps) {
      nextState.pagination = nextProps.pagination;

      const newPagination = {
        ...prevState.pagination,
        ...nextProps.pagination
      };
      newPagination.current = newPagination.current || 1;
      newPagination.pageSize = newPagination.pageSize || 10;

      if (nextProps.pagination !== false) {
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

  columnSettingMenuShow = e => {
    e.target.className = "tablex__head__cell__title__dropdown opened";

    let el = e.target;

    let head = getParentElement(el, ".tablex-table-head");

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

    this.setState({
      columnsConfig: newConfigs
    });
  };

  formatColumns = () => {
    let { columns, columnsConfig } = this.state;

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

    cols.forEach((d, i) => {
      let columnKey = d.key || d.dataIndex;
      let config = configs[columnKey] || configs[columnKey] || {};

      if ("fixed" in config) {
        d.fixed = config.fixed;
      }

      if ("width" in config) {
        d.width = config.width;
      }

      if ("order" in config) {
        d.order = config.order;
      } else {
        d.order = i;
      }

      d.headCellRender = ({ title }) => {
        return (
          <div className="tablex__head__cell__title">
            {title}
            <span
              className="tablex__head__cell__title__dropdown"
              data-columnkey={columnKey}
              onClick={this.columnSettingMenuShow}
            />
          </div>
        );
      };
    });

    arr = orderBy(arr, ["order"], ["asc"]);

    return cloneDeep(arr);
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

    if (typeof this.props.header === "function") {
      headerExtra = this.props.header();
    }

    if (headerExtra) {
      header = <div className="tablex__container__header">{headerExtra}</div>;
    }

    return header;
  };

  renderFooter = () => {
    let footer = null;

    let { pagination: pageAttr, data } = this.state;

    let { settable, tableId } = this.props;

    let footerExtra = null;

    if (typeof this.props.footer === "function") {
      footerExtra = this.props.footer();
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

    if (pager !== null || settingButton !== null || footerExtra !== null) {
      footer = (
        <div className="tablex__container__footer">
          {settingButton}
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
    let cls = "";
    if (rowIndex % 2 === 0) {
      cls = "tablex__row--even";
    } else {
      cls = "tablex__row--odd";
    }

    return cls;
  };

  render() {
    let props = this.props;

    let { columnMenu, data } = this.state;

    let columns = this.formatColumns();

    let arr = data;
    if (this.hasPagination()) {
      arr = this.getCurrentPageData(data);
    }

    let newProps = {
      data: arr,
      columns,
      onColumnResizeStop: this.onColumnResize,
      emptyRenderer: this.emptyRenderer
    };

    if (props.striped === true) {
      newProps.rowClassName = this.rowClassName;
      newProps.className = "tablex__striped";
    }

    if (this.props.loading === true) {
      newProps.overlayRenderer = this.overlayRenderer;
    }

    let columnMenuState = columnMenu || {};

    return (
      <div className="tablex__container">
        {this.renderHeader()}
        <div className="tablex__container__body">
          <Table {...props} {...newProps} />
        </div>
        {this.renderFooter()}

        <Popover
          trigger="click"
          onVisibleChange={this.columnSettingMenuHide}
          content={
            <ColumnDropMenu
              options={{ pinable: true, filterable: true, groupable: false }}
              columns={this.state.columns}
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
      </div>
    );
  }
}

FeaturedTable.defaultProps = {
  orderNumber: true,
  settable: true,
  pagination: false,
  loading: false,
  striped: true
};

FeaturedTable.propTypes = {
  /** 数据是否加载中 */
  loading: PropTypes.bool,

  /** 是否显示序号 */
  orderNumber: PropTypes.bool,

  /** 分页 */
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 是否可进行属性设置 */
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
