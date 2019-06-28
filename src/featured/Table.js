import React from "react";
import Table from "../base/index";
import Pagination from "./pagination";
import ColumnDropMenu from "./ColumnDropMenu";
import { treeToFlatten as treeToList, treeFilter } from "../base/utils";
import Setting, { getConfigs, setConfigs } from "./setting";
import orderBy from "lodash/orderBy";
import Popover from "antd/lib/popover";
import cloneDeep from "lodash/cloneDeep";

/**
 * 表格
 */
class EditableTable extends React.Component {
  dropdown_button_ref = React.createRef();

  constructor(props) {
    super(props);

    let configs = {};

    if (props.tableId) {
      configs = getConfigs(props.tableId) || {};
    }

    this.state = {
      pagination: false,
      columns: [],
      columnsConfig: configs.columnsConfig || null,
      columnMenu: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    let columns = nextProps.columns || [];

    nextState.columns = columns;

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
    e.target.className = "tablex__column__inner__dropdown opened";

    if (this.dropdown_button_ref && this.dropdown_button_ref.current) {
      this.dropdown_button_ref.current.click();
    }

    this.setState({
      columnMenu: {
        columnKey: e.target.dataset.columnkey,
        trigger: e.target,
        visible: true,
        offsetX: e.clientX,
        offsetY: e.clientY
      }
    });
  };

  columnSettingMenuHide = () => {
    let columnMenu = this.state.columnMenu || {};
    if (columnMenu.trigger) {
      columnMenu.trigger.className = "tablex__column__inner__dropdown";
    }
    this.setState({
      columnMenu: Object.assign(columnMenu, { visible: false, trigger: null })
    });
  };

  onColumnResize = ({ column, width }) => {
    let columnKey = column.key || column.dataIndex;
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

      let config = configs[columnKey] || {};
      bl = !config.hidden;

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

      d.headerRenderer = ({ column }) => {
        return (
          <div className="tablex__column__inner">
            <span className="tablex__column__inner__title">{column.title}</span>
            <span
              className="tablex__column__inner__dropdown"
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

  renderHeader = () => {
    let header = null;

    let { editToolsConfig = {}, editable } = this.props;
    let toolBarPosition = editToolsConfig.position;

    if (toolBarPosition === "top") {
      header = <div className="tablex__container__header" />;
    }

    return header;
  };

  renderFooter = () => {
    let footer = null;

    let pageAttr = this.state.pagination;
    const dataTotal = pageAttr.total || this.state.data.length;

    let hasPager = this.hasPagination();

    let pager = null;

    if (hasPager) {
      pager = (
        <Pagination
          {...pageAttr}
          total={dataTotal}
          onPageChange={this.onPageChange}
        />
      );
    }

    if (pager !== null) {
      footer = <div className="tablex__container__footer">{pager}</div>;
    }

    return footer;
  };

  render() {
    let props = this.props;

    let { columnMenu } = this.state;

    let columns = this.formatColumns();

    let arr = props.data;
    if (this.hasPagination()) {
      arr = this.getCurrentPageData(props.data);
    }

    let newProps = {
      data: arr,
      columns,
      onColumnResize: this.onColumnResize
    };

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
              position: "fixed",
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

export default EditableTable;
