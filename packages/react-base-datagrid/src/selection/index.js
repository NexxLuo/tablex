import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "../base";
import "./styles.css";
import Checkbox from "./Checkbox";
import { removeCheckedKey, addCheckedKeyWithDisabled } from "./utils";

class SelectionGrid extends Component {
  constructor(props) {
    super(props);

    let selectedKeys = [];

    if (props.defaultSelectedRowKeys instanceof Array === true) {
      selectedKeys = props.defaultSelectedRowKeys;
    }

    this.state = {
      prevProps: null,
      data: [],
      flatData: [],
      treeProps: {},
      columns: [],
      prependColumns: [],
      rowKey: "",
      selectedRowKeys: selectedKeys,
      disabledSelectKeys: [],
      halfCheckedKeys: [],
      selectMode: "",
      rowSelectClassName: "",
      checkStrictly: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let {
      data,
      columns,
      rowKey,
      selectMode,
      rowSelectClassName,
      checkStrictly,
      flatData,
      treeProps,
      selectedRowKeys,
      halfCheckedKeys,
      disabledSelectKeys,
      prependColumns = [],
      selectOnRowClick
    } = nextProps;

    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let extraColumns = [];

      if (selectMode === "multiple") {
        let selectionColumn = {
          key: "__checkbox_column",
          dataIndex: "__checkbox_column",
          __type: "__checkbox_column",
          resizable: false,
          width: 50,
          align: "center"
        };

        let c = nextProps.selectionColumn;
        if (c !== false && c !== null) {
          if (c instanceof Object) {
            selectionColumn = Object.assign({}, selectionColumn, c);
          }
          extraColumns.unshift(selectionColumn);
        }
      }

      nextState = {
        rowKey,
        data: data,
        flatData: flatData,
        treeProps,
        columns: columns,
        prependColumns: extraColumns.concat(prependColumns),
        prevProps: nextProps,
        selectMode,
        rowSelectClassName,
        checkStrictly,
        selectOnRowClick
      };

      if ("selectedRowKeys" in nextProps) {
        nextState.selectedRowKeys = selectedRowKeys;
        if (selectedRowKeys.length === 0) {
          nextState.halfCheckedKeys = [];
        }
      }

      if ("halfCheckedKeys" in nextProps) {
        nextState.halfCheckedKeys = halfCheckedKeys;
      }

      if ("disabledSelectKeys" in nextProps) {
        nextState.disabledSelectKeys = disabledSelectKeys;
      }
    }

    return nextState;
  }

  getParents = key => {
    let { treeProps } = this.state;
    let p = (treeProps || {})[key] || {};
    let parents = p.parents || [];

    return parents;
  };

  /** 通过rowKey获取数据行 */
  getRowsByKeys = (keys = []) => {
    let rows = [];
    let { rowKey, flatData: arr } = this.state;

    let rowKeys = {};

    for (let i = 0, len = keys.length; i < len; i++) {
      rowKeys[keys[i]] = true;
    }

    for (let i = 0, len = arr.length; i < len; i++) {
      let d = arr[i];
      if (rowKeys[d[rowKey]] === true) {
        rows.push(d);
      }
    }

    return rows;
  };

  /** 是否为单选 */
  isSingleSelect = () => {
    return this.state.selectMode === "single";
  };

  /** 是否为多选 */
  isMultipleSelect = () => {
    return this.state.selectMode === "multiple";
  };

  /** 当前行是否被禁用选择 */
  isDisabledSelect = key => {
    let bl = this.state.disabledSelectKeys.findIndex(d => d === key) > -1;
    return bl;
  };

  /** single change */
  onSelectChange = (rowKey, rowData, rowIndex) => {
    let { selectedRowKeys } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);
    let nextKeys = [].concat(selectedRowKeys);
    if (this.isDisabledSelect(rowKey)) {
      return;
    }

    if (this.isSingleSelect()) {
      if (i > -1) {
        nextKeys = [];

        if (typeof this.props.onUnSelect === "function") {
          this.props.onUnSelect(rowData, rowIndex, rowKey);
        }
      } else {
        nextKeys = [rowKey];

        if (typeof this.props.onSelect === "function") {
          this.props.onSelect(rowData, rowIndex, rowKey);
        }
      }
    } else if (this.isMultipleSelect()) {
      if (i > -1) {
        nextKeys.splice(i, 1);

        if (typeof this.props.onUnSelect === "function") {
          this.props.onUnSelect(nextKeys, this.getRowsByKeys(nextKeys), rowKey);
        }
      } else {
        nextKeys.push(rowKey);

        if (typeof this.props.onSelect === "function") {
          this.props.onSelect(nextKeys, this.getRowsByKeys(nextKeys), rowKey);
        }
      }
    } else {
      return;
    }

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextKeys, this.getRowsByKeys(nextKeys), rowKey);
    }

    this.setState({ selectedRowKeys: nextKeys });
  };

  /** 判断行/行父级是否被禁用选中 */
  isDisabledCheck = (key, rowData) => {
    let arr = this.state.disabledSelectKeys;
    let bl = arr.indexOf(key) > -1;

    if (bl === false) {
      let parentKeys = this.getParents(key);

      for (let i = 0; i < parentKeys.length; i++) {
        const p = parentKeys[i];
        if (arr.indexOf(p) > -1) {
          bl = true;
          break;
        }
      }
    }
    return bl;
  };

  onCheckChange = (bl, value) => {
    if (this.state.checkStrictly === false) {
      this.onSelectChange(value);
    } else {
      if (bl === true) {
        this.addChecked(value);
      } else {
        this.removeChecked(value);
      }
    }
  };

  isSelected = key => {
    let { selectedRowKeys: keys } = this.state;
    for (let i = 0, len = keys.length; i < len; i++) {
      if (key === keys[i]) {
        return true;
      }
    }
    return false;
  };

  isSelectedAll = () => {
    let { selectedRowKeys, flatData, rowKey } = this.state;

    if (flatData.length === 0 || selectedRowKeys.length === 0) {
      return false;
    }

    if (selectedRowKeys.length >= flatData.length) {
      let bl = true;

      let selectedMap = {};

      for (let i = 0, len = selectedRowKeys.length; i < len; i++) {
        selectedMap[selectedRowKeys[i]] = true;
      }

      for (let i = 0, len = flatData.length; i < len; i++) {
        let dk = flatData[i][rowKey];
        if (selectedMap[dk] !== true) {
          bl = false;
          break;
        }
      }

      return bl;
    } else {
      return false;
    }
  };

  /** 添加复选行 */
  addChecked(key) {
    let {
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledSelectKeys,
      treeProps
    } = this.state;

    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = addCheckedKeyWithDisabled({
      key,
      treeProps,
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledSelectKeys
    });

    if (typeof this.props.onSelect === "function") {
      this.props.onSelect(nextKeys, this.getRowsByKeys(nextKeys), key);
    }

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextKeys, this.getRowsByKeys(nextKeys), key);
    }

    this.setState({
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    });
  }

  /** 移除复选行 */
  removeChecked(key) {
    let {
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      treeProps
    } = this.state;
    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = removeCheckedKey({
      key,
      treeProps,
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys
    });

    if (typeof this.props.onUnSelect === "function") {
      this.props.onUnSelect(nextKeys, this.getRowsByKeys(nextKeys), key);
    }

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextKeys, this.getRowsByKeys(nextKeys), key);
    }

    this.setState({
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    });
  }

  onCheckAllChange = (bl, value, { indeterminate }) => {
    if (indeterminate === true && this.state.disabledSelectKeys.length > 0) {
      this.removeAllChecked();
    } else {
      if (bl === true) {
        this.addAllChecked();
      } else {
        this.removeAllChecked();
      }
    }
  };

  addAllChecked = () => {
    let { rowKey, flatData } = this.state;
    let nextSelected = [];
    let arr = [];

    flatData.forEach(d => {
      let k = d[rowKey];

      let bl = !this.isDisabledCheck(k, d);

      if (bl) {
        nextSelected.push(k);
        arr.push(d);
      }
    });

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextSelected, arr, "");
    }

    if (typeof this.props.onSelectAll === "function") {
      this.props.onSelectAll(nextSelected, arr, "");
    }

    this.setState({
      selectedRowKeys: nextSelected,
      halfCheckedKeys: []
    });
  };

  removeAllChecked = () => {
    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange([], [], "");
    }

    if (typeof this.props.onUnSelectAll === "function") {
      this.props.onUnSelectAll([], [], "");
    }

    this.setState({
      selectedRowKeys: [],
      halfCheckedKeys: []
    });
  };

  checkboxCellRender = (value, rowData, index) => {
    let { rowKey, selectedRowKeys, halfCheckedKeys } = this.state;

    let key = rowData[rowKey];

    let attr = {
      checked: false,
      disabled: false,
      indeterminate: false
    };

    if (selectedRowKeys.indexOf(key) > -1) {
      attr.checked = true;
    }

    if (halfCheckedKeys.indexOf(key) > -1) {
      attr.indeterminate = true;
    }

    if (this.isDisabledCheck(key, rowData)) {
      attr.disabled = true;
    }

    let c = this.props.selectionColumn;

    if (c !== false && c !== null) {
      if (c instanceof Object) {
        let selectionColumnRender = c.render;
        if (typeof selectionColumnRender === "function") {
          return (
            selectionColumnRender(rowData, index, {
              ...attr,
              value: key,
              onChange: checked => {
                this.onCheckChange(checked, key);
              }
            }) || null
          );
        }
      }
    }

    return (
      <Checkbox
        rowData={rowData}
        value={key}
        {...attr}
        onChange={this.onCheckChange}
      />
    );
  };

  checkboxHeadRender = () => {
    let { selectedRowKeys, halfCheckedKeys, flatData, rowKey } = this.state;

    let isCheckedAll = true;

    let attr = {
      checked: false,
      indeterminate: false
    };

    isCheckedAll = this.isSelectedAll();

    if (flatData.length > 0) {
      if (isCheckedAll === true) {
        attr.checked = true;
      } else {
        if (selectedRowKeys.length > 0 || halfCheckedKeys.length > 0) {
          attr.indeterminate = true;
        }
      }
    }

    let c = this.props.selectionColumn;

    if (c !== false && c !== null) {
      if (c instanceof Object) {
        let selectionColumnTitle = c.title;

        if (typeof selectionColumnTitle === "function") {
          return (
            selectionColumnTitle({
              ...attr,
              onChange: checked => this.onCheckAllChange(checked)
            }) || null
          );
        }
      }
    }

    return <Checkbox {...attr} onChange={this.onCheckAllChange} />;
  };

  rowClassName = ({ rowData, rowIndex }) => {
    let { rowKey, selectedRowKeys, rowSelectClassName } = this.state;
    let key = rowData[rowKey];
    let isSelected = false;

    if (selectedRowKeys.indexOf(key) > -1) {
      isSelected = true;
    }

    let cls = [];

    if (isSelected) {
      cls.push(rowSelectClassName);
    }

    let tempCls = "";
    if (typeof this.props.rowClassName === "function") {
      tempCls = this.props.rowClassName(rowData, rowIndex);
    }

    tempCls && cls.push(tempCls);

    return cls.join(" ");
  };

  onRow = (rowData, rowIndex, rowProps, rowExtra) => {
    let fn = this.props.onRow;

    let o = {};
    if (typeof fn === "function") {
      o = fn(rowData, rowIndex, rowProps, rowExtra) || {};
    }

    return {
      ...o,
      onClick: () => {
        let { selectedRowKeys, rowKey: key, selectOnRowClick } = this.state;
        let rowKey = rowData[key];

        if (this.isSingleSelect()) {
          this.onSelectChange(rowKey, rowData, rowIndex);
        }

        if (selectOnRowClick && this.isMultipleSelect()) {
          let isSelected = selectedRowKeys.indexOf(rowKey) > -1;
          let isEnabled = !this.isDisabledCheck(rowKey, rowData);
          isEnabled && this.onCheckChange(!isSelected, rowKey);
        }

        if (typeof o.onClick === "function") {
          o.onClick({ rowData, rowIndex, rowKey, event });
        }
      }
    };
  };

  render() {
    let { columns, prependColumns } = this.state;
    let props = this.props;

    let checkboxColumn = prependColumns.find(
      d => d.__type === "__checkbox_column"
    );

    if (checkboxColumn) {
      checkboxColumn.render = this.checkboxCellRender;
      checkboxColumn.title = this.checkboxHeadRender;
    }

    let newProps = {
      columns,
      prependColumns,
      rowClassName: this.rowClassName,
      onRow: this.onRow
    };

    return <Table {...props} {...newProps} />;
  }
}

SelectionGrid.defaultProps = {
  rowKey: "key",
  columns: [],
  data: [],
  selectMode: "single",
  checkStrictly: true,
  rowSelectClassName: "tablex__row--selected",
  selectionColumn: true,
  selectOnRowClick: true
};

SelectionGrid.propTypes = {
  /** 行选中时的样式类名 */
  rowSelectClassName: PropTypes.string,
  /** 选择模式：多选 单选 不可选择 */
  selectMode: PropTypes.oneOf(["multiple", "single", "none"]),

  /** 复选列配置 */
  selectionColumn: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 点击行时，是否触发选择操作 */
  selectOnRowClick: PropTypes.bool,

  /** 如若设置了此列，复选框将独占一列 */
  selectionColumnKey: PropTypes.string,

  /** 默认选中的行键值 */
  defaultSelectedRowKeys: PropTypes.array,

  /** 选中的行键值 */
  selectedRowKeys: PropTypes.array,
  /** 将被禁用选中的行key */
  disabledSelectKeys: PropTypes.array,
  /**
   * 行选择事件
   *  (selectedKeys,selectedRows,triggerKey) => void
   * */
  onSelectChange: PropTypes.func,

  /** 行单选事件 */
  onSelect: PropTypes.func,
  /** 行单选取消事件 */
  onUnSelect: PropTypes.func,
  /** 全选事件 */
  onSelectAll: PropTypes.func,
  /** 取消全选事件 */
  onUnSelectAll: PropTypes.func,

  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool
};

export default SelectionGrid;
