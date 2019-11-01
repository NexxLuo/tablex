import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "../base";
import "./styles.css";
import Checkbox from "./Checkbox";
import {
  removeCheckedKey,
  addCheckedKeyWithDisabled,
  filterDataByKeys,
  removeKeysByData,
  getSelectionChanged
} from "./utils";

function getSelectionConfig(props) {
  let selectionColumn = null;
  let selectionProps = {};

  let { selectMode, selectionColumn: c, rowSelection } = props;

  if (rowSelection instanceof Object) {
    let { type, columnWidth, columnTitle, fixed, showCheckbox } = rowSelection;

    let showSelectioColumn = false;

    if (type === "checkbox") {
      showSelectioColumn = true;
    }

    if (typeof showCheckbox === "boolean") {
      showSelectioColumn = showCheckbox;
    }

    if (showSelectioColumn === true) {
      let defaultSelectionColumn = {
        key: "__checkbox_column",
        dataIndex: "__checkbox_column",
        __type: "__checkbox_column",
        resizable: false,
        width: 50,
        align: "center"
      };

      selectionColumn = defaultSelectionColumn;

      let resetSelectionColumn = {};

      if ("columnWidth" in rowSelection) {
        resetSelectionColumn.width = columnWidth;
      }

      if ("columnTitle" in rowSelection) {
        resetSelectionColumn.title = columnTitle;
      }

      if (fixed === true) {
        resetSelectionColumn.fixed = "left";
      }

      selectionColumn = Object.assign(
        {},
        defaultSelectionColumn,
        resetSelectionColumn
      );
    }

    if ("selectedRowKeys" in rowSelection) {
      selectionProps.selectedRowKeys = rowSelection.selectedRowKeys;
    }
  } else {
    if (selectMode === "multiple") {
      let defaultSelectionColumn = {
        key: "__checkbox_column",
        dataIndex: "__checkbox_column",
        __type: "__checkbox_column",
        resizable: false,
        width: 50,
        align: "center"
      };

      selectionColumn = defaultSelectionColumn;

      if (c !== false && c !== null) {
        if (c instanceof Object) {
          selectionColumn = Object.assign({}, defaultSelectionColumn, c);
        }
      }
    }

    if ("selectedRowKeys" in props) {
      selectionProps.selectedRowKeys = props.selectedRowKeys;
    }

    if ("halfCheckedKeys" in props) {
      selectionProps.halfCheckedKeys = props.halfCheckedKeys;
    }

    if ("disabledSelectKeys" in props) {
      selectionProps.disabledSelectKeys = props.disabledSelectKeys;
    }
  }

  return { selectionProps, selectionColumn };
}

class SelectionGrid extends Component {
  constructor(props) {
    super(props);

    let selectedKeys = [];
    let selectedRows = [];

    if (props.defaultSelectedRowKeys instanceof Array === true) {
      let { data, keys } = filterDataByKeys(
        props.data,
        props.rowKey,
        props.defaultSelectedRowKeys
      );

      selectedKeys = keys;
      selectedRows = data;
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
      selectedRows: selectedRows,
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
      prependColumns = [],
      selectedRowKeys,
      halfCheckedKeys,
      disabledSelectKeys,
      selectOnRowClick
    } = nextProps;

    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let extraColumns = [];

      let { selectionProps, selectionColumn } = getSelectionConfig(nextProps);
      if (selectionColumn) {
        extraColumns.unshift(selectionColumn);
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

      if ("selectedRowKeys" in selectionProps) {
        let { data: selectedData, keys } = filterDataByKeys(
          data.concat(prevState.selectedRows),
          rowKey,
          selectionProps.selectedRowKeys
        );

        nextState.selectedRowKeys = keys;
        nextState.selectedRows = selectedData;
        if (selectedRowKeys.length === 0) {
          nextState.halfCheckedKeys = [];
        }
      }

      if ("halfCheckedKeys" in selectionProps) {
        nextState.halfCheckedKeys = selectionProps.halfCheckedKeys;
      }

      if ("disabledSelectKeys" in selectionProps) {
        nextState.disabledSelectKeys = selectionProps.disabledSelectKeys;
      }
    }

    return nextState;
  }

  call_onSelect = ({
    selectMode,
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows
  }) => {
    let rfn = this.getRowSelection("onSelect");
    if (typeof rfn === "function") {
      rfn(rowData, true, selectedRows);
    } else {
      let fn = this.props.onSelect;
      if (typeof fn === "function") {
        if (selectMode === "multiple") {
          fn(selectedRowKeys, selectedRows, rowKey, { rowIndex, rowData });
        } else {
          fn(rowData, rowIndex, rowKey, { rowData, rowIndex });
        }
      }
    }
  };

  call_onUnSelect = ({
    selectMode,
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows
  }) => {
    let rfn = this.getRowSelection("onSelect");
    if (typeof rfn === "function") {
      rfn(rowData, false, selectedRows);
    } else {
      let fn = this.props.onUnSelect;
      if (typeof fn === "function") {
        if (selectMode === "multiple") {
          fn(selectedRowKeys, selectedRows, rowKey, { rowIndex, rowData });
        } else {
          fn(rowData, rowIndex, rowKey, { rowData, rowIndex });
        }
      }
    }
  };

  call_onSelectChange = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows
  }) => {
    let rfn = this.getRowSelection("onChange");
    if (typeof rfn === "function") {
      rfn(selectedRowKeys, selectedRows);
    } else {
      let fn = this.props.onSelectChange;

      if (typeof fn === "function") {
        fn(selectedRowKeys, selectedRows, rowKey, { rowIndex, rowData });
      }
    }
  };

  call_onSelectAll = ({ selectedRowKeys, selectedRows, changedRows }) => {
    let rfn = this.getRowSelection("onSelectAll");
    if (typeof rfn === "function") {
      rfn(true, selectedRows, changedRows);
    } else {
      let fn = this.props.onSelectAll;
      if (typeof fn === "function") {
        fn(selectedRowKeys, selectedRows);
      }
    }
  };

  call_onUnSelectAll = ({ selectedRowKeys, selectedRows, changedRows }) => {
    let rfn = this.getRowSelection("onSelectAll");
    if (typeof rfn === "function") {
      rfn(false, selectedRows, changedRows);
    } else {
      let fn = this.props.onUnSelectAll;
      if (typeof fn === "function") {
        fn(selectedRowKeys, selectedRows);
      }
    }
  };

  call_onBeforeSelect = params => {
    let rfn = this.getRowSelection("onBeforeSelect");
    if (typeof rfn === "function") {
      return rfn(params);
    } else {
      let fn = this.props.onBeforeSelect;
      if (typeof fn === "function") {
        return fn(params);
      }
    }

    return true;
  };

  call_onBeforeSelectAll = params => {
    let rfn = this.getRowSelection("onBeforeSelectAll");
    if (typeof rfn === "function") {
      return rfn(params);
    } else {
      let fn = this.props.onBeforeSelectAll;
      if (typeof fn === "function") {
        return fn(params);
      }
    }

    return true;
  };

  hasRowSelection = () => {
    return this.props.rowSelection instanceof Object;
  };

  getRowSelection = k => {
    let rowSelection = this.props.rowSelection;
    if (rowSelection instanceof Object) {
      if (k) {
        return rowSelection[k];
      } else {
        return rowSelection;
      }
    } else {
      return undefined;
    }
  };

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
    let type = this.getRowSelection("type");

    if (type) {
      return type === "radio";
    } else {
      return this.state.selectMode === "single";
    }
  };

  /** 是否为多选 */
  isMultipleSelect = () => {
    let type = this.getRowSelection("type");

    if (type) {
      return type === "checkbox";
    } else {
      return this.state.selectMode === "multiple";
    }
  };

  /** 当前行是否被禁用选择 */
  isDisabledSelect = key => {
    let bl = this.state.disabledSelectKeys.findIndex(d => d === key) > -1;
    return bl;
  };

  onBeforeSelect = params => {
    let bl = this.call_onBeforeSelect(params);
    return bl;
  };

  /** single change */
  onSelectChange = (rowKey, rowData, rowIndex) => {
    let { selectedRowKeys, selectedRows, rowKey: key } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);
    let nextKeys = [].concat(selectedRowKeys);
    let nextRows = [].concat(selectedRows);

    if (this.isDisabledSelect(rowKey)) {
      return;
    }

    if (this.isSingleSelect()) {
      if (i > -1) {
        nextKeys = [];
        nextRows = [];

        this.call_onUnSelect({
          rowKey,
          rowIndex,
          rowData,
          selectedRowKeys: nextKeys,
          selectedRows: nextRows,
          selectMode: "single"
        });
      } else {
        nextKeys = [rowKey];
        nextRows = [rowData];

        this.call_onSelect({
          rowKey,
          rowIndex,
          rowData,
          selectedRowKeys: nextKeys,
          selectedRows: nextRows,
          selectMode: "single"
        });
      }
    } else if (this.isMultipleSelect()) {
      if (i > -1) {
        nextKeys.splice(i, 1);

        let j = nextRows.findIndex(d => d[key] === rowKey);
        if (j > -1) {
          nextRows.splice(j, 1);
        }

        this.call_onUnSelect({
          selectedRowKeys: nextKeys,
          selectedRows: nextRows,
          rowKey,
          rowIndex,
          rowData,
          selectMode: "multiple"
        });
      } else {
        nextKeys.push(rowKey);
        nextRows.push(rowData);
        this.call_onSelect({
          selectedRowKeys: nextKeys,
          selectedRows: nextRows,
          rowKey,
          rowIndex,
          rowData,
          selectMode: "multiple"
        });
      }
    } else {
      return;
    }

    this.call_onSelectChange({
      rowData,
      rowIndex,
      rowKey,
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    });

    this.setState({ selectedRowKeys: nextKeys, selectedRows: nextRows });
  };

  /** 判断行/行父级是否被禁用选中 */
  isDisabledCheck = (key, rowData) => {
    let { checkStrictly, disabledSelectKeys: arr } = this.state;
    let bl = arr.indexOf(key) > -1;

    if (bl === false && checkStrictly) {
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

  onCheckChange = ({ selected, key, index, rowData }) => {
    if (this.state.checkStrictly === false || this.isSingleSelect()) {
      this.onSelectChange(key, rowData, index);
    } else {
      if (selected === true) {
        this.removeChecked(key, index, rowData);
      } else {
        this.addChecked(key, index, rowData);
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
  addChecked(key, rowIndex, rowData) {
    let {
      selectedRowKeys,
      selectedRows,
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

    // //记录上一次选中的行数据，避免翻页情况下的数据丢失
    let nextRows = filterDataByKeys(
      flatData.concat(selectedRows),
      rowKey,
      nextKeys
    ).data;

    this.call_onSelect({
      rowKey: key,
      rowIndex,
      rowData,
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      selectMode: "multiple"
    });

    this.call_onSelectChange({
      rowData,
      rowIndex,
      rowKey: key,
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    });

    this.setState({
      selectedRows: nextRows,
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    });
  }

  /** 移除复选行 */
  removeChecked(key, rowIndex, rowData) {
    let {
      selectedRowKeys,
      selectedRows,
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

    let nextRows = filterDataByKeys(
      flatData.concat(selectedRows),
      rowKey,
      nextKeys
    ).data;

    this.call_onUnSelect({
      rowKey: key,
      rowIndex,
      rowData,
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      selectMode: "multiple"
    });

    this.call_onSelectChange({
      rowData,
      rowIndex,
      rowKey: key,
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    });

    this.setState({
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      halfCheckedKeys: nextHalflCheckedKeys
    });
  }

  onBeforeSelectAll = selected => {
    let { selectedRows, selectedRowKeys } = this.state;

    let bl = this.call_onBeforeSelectAll({
      selected,
      selectedRows,
      selectedRowKeys,
      selectAll: this.addAllChecked,
      unSelectAll: this.removeAllChecked
    });

    return bl;
  };

  onCheckAllChange = (selected, value, { indeterminate }) => {
    let bl = this.onBeforeSelectAll(selected);

    if (bl === false) {
      return;
    }

    if (indeterminate === true && this.state.disabledSelectKeys.length > 0) {
      this.removeAllChecked();
    } else {
      if (selected === true) {
        this.removeAllChecked();
      } else {
        this.addAllChecked();
      }
    }
  };

  addAllChecked = () => {
    let { rowKey, selectedRows, selectedRowKeys, flatData } = this.state;

    let selectedKeys = selectedRowKeys.slice();

    flatData.forEach(d => {
      let k = d[rowKey];

      let bl = !this.isDisabledCheck(k, d);

      if (bl) {
        selectedKeys.push(k);
      }
    });

    let { changedKeys, changedRows } = getSelectionChanged({
      keyField: rowKey,
      selectedRowKeys: selectedRowKeys,
      data: flatData,
      triggerKeys: selectedKeys,
      selected: true
    });

    let nextKeys = selectedRowKeys.slice().concat(changedKeys);
    let nextRows = selectedRows.slice().concat(changedRows);

    // let { data: nextRows, keys: nextKeys } = filterDataByKeys(
    //   flatData.concat(selectedRows),
    //   rowKey,
    //   selectedKeys
    // );

    this.call_onSelectAll({
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      changedRows: changedRows
    });

    this.call_onSelectChange({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    });

    this.setState({
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      halfCheckedKeys: []
    });
  };

  /** 移除当前显示的所有数据 */
  removeAllChecked = () => {
    let { flatData, selectedRowKeys, selectedRows, rowKey } = this.state;

    let nextKeys = removeKeysByData(selectedRowKeys, rowKey, flatData);

    let nextRows = filterDataByKeys(
      flatData.concat(selectedRows),
      rowKey,
      nextKeys
    ).data;

    this.call_onUnSelectAll({
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      changedRows: flatData
    });

    this.call_onSelectChange({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    });

    this.setState({
      selectedRows: nextRows,
      selectedRowKeys: nextKeys,
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

    let fn = this.getRowSelection("getCheckboxProps");
    if (typeof fn === "function") {
      let p = fn(rowData);
      if (p instanceof Object) {
        attr = Object.assign(attr, p);
      }
    }

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
                let bl = this.onBeforeSelect({
                  selected: checked,
                  rowData,
                  index: index,
                  key: key,
                  callback: () => {
                    this.onCheckChange({
                      selected: checked,
                      key: key,
                      index: index,
                      rowData: rowData
                    });
                  }
                });

                if (bl !== false) {
                  this.onCheckChange({
                    selected: checked,
                    key: key,
                    index: index,
                    rowData: rowData
                  });
                }
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
        onChange={(checked, ck) => {
          let bl = this.onBeforeSelect({
            selected: checked,
            rowData,
            index: index,
            key: ck,
            callback: () => {
              this.onCheckChange({
                selected: checked,
                key: ck,
                index: index,
                rowData: rowData
              });
            }
          });

          if (bl !== false) {
            this.onCheckChange({
              selected: checked,
              key: ck,
              index: index,
              rowData: rowData
            });
          }
        }}
      />
    );
  };

  checkboxHeadRender = () => {
    let { selectedRowKeys, halfCheckedKeys, flatData, rowKey } = this.state;

    if (this.isSingleSelect()) {
      return null;
    }

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

    let SelectionTitle = this.getRowSelection("columnTitle");

    if (typeof SelectionTitle !== "undefined") {
      if (typeof SelectionTitle === "function") {
        return (
          <SelectionTitle
            selectAll={this.addAllChecked}
            unSelectAll={this.removeAllChecked}
          ></SelectionTitle>
        );
      } else {
        return SelectionTitle;
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
        let isSelected = selectedRowKeys.indexOf(rowKey) > -1;

        if (this.isSingleSelect()) {
          let bl = this.onBeforeSelect({
            selected: isSelected,
            rowData,
            index: rowIndex,
            key: rowKey,
            callback: () => {
              this.onSelectChange(rowKey, rowData, rowIndex);
            }
          });
          if (bl !== false) {
            this.onSelectChange(rowKey, rowData, rowIndex);
          }
        }

        if (this.isMultipleSelect() && selectOnRowClick) {
          let bl = this.onBeforeSelect({
            selected: isSelected,
            rowData,
            index: rowIndex,
            key: rowKey,
            callback: () => {
              this.onCheckChange({
                selected: isSelected,
                key: rowKey,
                index: rowIndex,
                rowData: rowData
              });
            }
          });
          if (bl !== false) {
            let isEnabled = !this.isDisabledCheck(rowKey, rowData);
            isEnabled &&
              this.onCheckChange({
                selected: isSelected,
                key: rowKey,
                index: rowIndex,
                rowData: rowData
              });
          }
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

  rowSelection: PropTypes.shape({
    columnTitle: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
      PropTypes.element
    ]),
    columnWidth: PropTypes.number,
    fixed: PropTypes.bool,
    getCheckboxProps: PropTypes.func,
    selectedRowKeys: PropTypes.array,
    type: PropTypes.oneOf(["checkbox", "radio"]),
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSelectAll: PropTypes.func,
    showCheckbox: PropTypes.bool,
    onBeforeSelect: PropTypes.func,
    onBeforeSelectAll: PropTypes.func
  }),

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

  /** 行选择前置事件,返回false取消选择操作 */
  onBeforeSelect: PropTypes.func,

  /** 行单选取消事件 */
  onUnSelect: PropTypes.func,

  /** 行全选前置事件,返回false取消选择操作 */
  onBeforeSelectAll: PropTypes.func,

  /** 全选事件 */
  onSelectAll: PropTypes.func,
  /** 取消全选事件 */
  onUnSelectAll: PropTypes.func,

  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool
};

export default SelectionGrid;
