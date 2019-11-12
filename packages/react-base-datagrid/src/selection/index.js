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
  getSelectionChanged,
  getRowSelectionFromProps,
  getSelectionConfigFromProps
} from "./utils";

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
      disabledCheckedKeys: [],
      halfCheckedKeys: [],
      checkedKeys: [],
      checkedRows: [],
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
      selectOnRowClick
    } = nextProps;

    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let extraColumns = [];

      let { selectionProps, selectionColumn } = getSelectionConfigFromProps(
        nextProps
      );
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

      if ("selectedRowKeys" in selectionProps) {
        nextState.selectedRowKeys = selectionProps.selectedRowKeys;
      }

      if ("checkedKeys" in selectionProps) {
        nextState.checkedKeys = selectionProps.checkedKeys;
      }

      if ("halfCheckedKeys" in selectionProps) {
        nextState.halfCheckedKeys = selectionProps.halfCheckedKeys;
      }

      if ("disabledSelectKeys" in selectionProps) {
        nextState.disabledSelectKeys = selectionProps.disabledSelectKeys;
      }

      if ("disabledCheckedKeys" in selectionProps) {
        nextState.disabledCheckedKeys = selectionProps.disabledCheckedKeys;
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
    let rfn = this.getRowSelection("onSelectChange");
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

  //

  call_onCheck = ({ rowData, rowIndex, rowKey, keys, rows }) => {
    let rfn = this.getRowSelection("onCheck");
    if (typeof rfn === "function") {
      rfn(rowData, true, rows);
    }
  };

  call_onUnCheck = ({ rowData, rowIndex, rowKey, keys, rows }) => {
    let rfn = this.getRowSelection("onCheck");
    if (typeof rfn === "function") {
      rfn(rowData, false, rows);
    }
  };

  call_onCheckChange = ({ rowData, rowIndex, rowKey, keys, rows }) => {
    let rfn = this.getRowSelection("onChange");
    if (typeof rfn === "function") {
      rfn(keys, rows);
    }
  };

  call_onCheckAll = ({ keys, rows, changed }) => {
    let rfn = this.getRowSelection("onCheckAll");
    if (typeof rfn === "function") {
      rfn(true, rows, changed);
    } else {
      let fn = this.props.onSelectAll;
      if (typeof fn === "function") {
        fn(keys, rows);
      }
    }
  };

  call_onUnCheckAll = ({ keys, rows, changed }) => {
    let rfn = this.getRowSelection("onCheckAll");
    if (typeof rfn === "function") {
      rfn(false, rows, changed);
    } else {
      let fn = this.props.onUnSelectAll;
      if (typeof fn === "function") {
        fn(keys, rows);
      }
    }
  };

  call_onBeforeCheck = params => {
    let rfn = this.getRowSelection("onBeforeCheck");
    if (typeof rfn === "function") {
      return rfn(params);
    }

    return true;
  };

  call_onBeforeCheckAll = params => {
    let rfn = this.getRowSelection("onBeforeCheckAll");
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
  //

  onBeforeSelect = params => {
    let bl = this.call_onBeforeSelect(params);
    return bl;
  };

  onBeforeCheck = params => {
    let bl = this.call_onBeforeCheck(params);
    return bl;
  };

  hasRowSelection = () => {
    return this.props.rowSelection instanceof Object;
  };

  getRowSelection = k => {
    let r = getRowSelectionFromProps(this.props, k);
    return r;
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

  /** 判断行/行父级是否被禁用选中 */
  isDisabledCheck = key => {
    let { checkStrictly, disabledCheckedKeys: arr } = this.state;

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

  isCheckedAll = () => {
    let { checkedKeys, flatData, rowKey } = this.state;

    let keys = checkedKeys;

    if (flatData.length === 0 || keys.length === 0) {
      return false;
    }

    if (keys.length >= flatData.length) {
      let bl = true;

      let selectedMap = {};

      for (let i = 0, len = keys.length; i < len; i++) {
        selectedMap[keys[i]] = true;
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

  addSelected = ({ rowKey, rowData, rowIndex, quiet = false }) => {
    let { selectedRowKeys, selectedRows } = this.state;

    let nextKeys = selectedRowKeys.slice();
    let nextRows = selectedRows.slice();

    let type = "";

    if (this.isSingleSelect()) {
      nextKeys = [rowKey];
      nextRows = [rowData];
      type = "single";
    } else if (this.isMultipleSelect()) {
      nextKeys.push(rowKey);
      nextRows.push(rowData);
      type = "multiple";
    }

    let nextState = {
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    };

    if (quiet === false) {
      if (this.getRowSelection("checkOnSelect") === true) {
        let {
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextHalfCheckedKeys
        } = this.addChecked(rowKey, rowIndex, rowData, true);

        nextState.checkedKeys = nextCheckedKeys;
        nextState.checkedRows = nextCheckedRows;
        nextState.halfCheckedKeys = nextHalfCheckedKeys;

        if (this.getRowSelection("selectOnCheck") === true) {
          nextState.selectedRowKeys = nextCheckedKeys;
          nextState.selectedRows = nextCheckedRows;
        }
      }

      this.setState(nextState);
    }

    this.call_onSelect({
      selectedRowKeys: nextState.selectedRowKeys,
      selectedRows: nextState.selectedRows,
      rowKey,
      rowIndex,
      rowData,
      selectMode: type
    });

    this.call_onSelectChange({
      rowData,
      rowIndex,
      rowKey,
      selectedRowKeys: nextState.selectedRowKeys,
      selectedRows: nextState.selectedRows
    });

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  removeSelected = ({ rowKey, rowData, rowIndex, quiet = false }) => {
    let { selectedRowKeys, selectedRows, rowKey: keyField } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);

    let nextKeys = selectedRowKeys.slice();
    let nextRows = selectedRows.slice();

    let type = "";

    if (this.isSingleSelect()) {
      nextKeys = [];
      nextRows = [];
      type = "single";
    } else if (this.isMultipleSelect()) {
      if (i > -1) {
        nextKeys.splice(i, 1);

        let j = nextRows.findIndex(d => d[keyField] === rowKey);
        if (j > -1) {
          nextRows.splice(j, 1);
        }
      }

      type = "multiple";
    }

    let nextState = {
      selectedRowKeys: nextKeys,
      selectedRows: nextRows
    };

    if (quiet === false) {
      if (this.getRowSelection("checkOnSelect") === true) {
        let {
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextHalfCheckedKeys
        } = this.removeChecked(rowKey, rowIndex, rowData, true);

        nextState.checkedKeys = nextCheckedKeys;
        nextState.checkedRows = nextCheckedRows;
        nextState.halfCheckedKeys = nextHalfCheckedKeys;

        if (this.getRowSelection("selectOnCheck") === true) {
          nextState.selectedRowKeys = nextCheckedKeys;
          nextState.selectedRows = nextCheckedRows;
        }
      }

      this.setState(nextState);
    }

    this.call_onUnSelect({
      selectedRowKeys: nextState.selectedRowKeys,
      selectedRows: nextState.selectedRows,
      rowKey,
      rowIndex,
      rowData,
      selectMode: type
    });

    this.call_onSelectChange({
      rowData,
      rowIndex,
      rowKey,
      selectedRowKeys: nextState.selectedRowKeys,
      selectedRows: nextState.selectedRows
    });

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  addAllSelected = ({ keys, rows, changedRows, quiet = false }) => {
    let nextKeys = keys;
    let nextRows = rows;

    if (quiet === false) {
      this.call_onSelectChange({
        rowData: null,
        rowIndex: -1,
        rowKey: "",
        selectedRowKeys: nextKeys,
        selectedRows: nextRows
      });
    }

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  removeAllSelected = ({ keys, rows, changedRows, quiet = false }) => {
    let nextKeys = keys;
    let nextRows = rows;

    if (quiet === false) {
      this.call_onSelectChange({
        rowData: null,
        rowIndex: -1,
        rowKey: "",
        selectedRowKeys: nextKeys,
        selectedRows: nextRows
      });
    }

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  onRowClick = ({ rowData, rowIndex }) => {
    let { rowKey: keyField, selectOnRowClick } = this.state;

    let rowKey = rowData[keyField];

    if (selectOnRowClick === true) {
      this.onSelectChange(rowKey, rowData, rowIndex);
    }
  };

  /** single change */
  onSelectChange = (rowKey, rowData, rowIndex) => {
    let { selectedRowKeys } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);
    let isSelected = i > -1;

    let bl = this.onBeforeSelect({
      selected: isSelected,
      rowData,
      index: rowIndex,
      key: rowKey,
      callback: () => {
        if (isSelected) {
          this.removeSelected({ rowKey, rowData, rowIndex });
        } else {
          this.addSelected({ rowKey, rowData, rowIndex });
        }
      }
    });

    if (bl === false) {
      return;
    }

    if (this.isDisabledSelect(rowKey)) {
      return;
    }

    if (isSelected) {
      this.removeSelected({ rowKey, rowData, rowIndex });
    } else {
      this.addSelected({ rowKey, rowData, rowIndex });
    }
  };

  onCheckChange = ({ selected, key, index, rowData }) => {
    let isSelected = selected;

    let bl = this.onBeforeCheck({
      selected: isSelected,
      rowData,
      index: index,
      key: key,
      callback: () => {
        if (isSelected) {
          this.removeChecked(key, index, rowData);
        } else {
          this.addChecked(key, index, rowData);
        }
      }
    });

    if (bl === false) {
      return;
    }

    if (selected === true) {
      this.removeChecked(key, index, rowData);
    } else {
      this.addChecked(key, index, rowData);
    }
  };

  /** 添加复选行 */
  addChecked(key, rowIndex, rowData, quiet = false) {
    let {
      checkedKeys,
      checkedRows,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledCheckedKeys,
      treeProps
    } = this.state;

    if (this.isSingleSelect()) {
      checkedKeys = [key];
      checkedRows = [rowData];
    } else if (!this.isMultipleSelect()) {
      return {
        keys: checkedKeys,
        rows: checkedRows,
        halfKeys: halfCheckedKeys
      };
    }

    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = addCheckedKeyWithDisabled({
      key,
      treeProps,
      selectedRowKeys: checkedKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledSelectKeys: disabledCheckedKeys
    });

    //记录上一次选中的行数据，避免翻页情况下的数据丢失
    let nextRows = filterDataByKeys(
      flatData.concat(checkedRows),
      rowKey,
      nextKeys
    ).data;

    this.call_onCheck({
      rowData,
      rowIndex,
      rowKey,
      keys: nextKeys,
      rows: nextRows
    });

    this.call_onCheckChange({
      rowData,
      rowIndex,
      rowKey,
      keys: nextKeys,
      rows: nextRows
    });

    if (quiet === false) {
      let nextState = {
        checkedRows: nextRows,
        checkedKeys: nextKeys,
        halfCheckedKeys: nextHalflCheckedKeys
      };

      if (this.getRowSelection("selectOnCheck") === true) {
        this.addSelected({
          rowKey: key,
          rowData: rowData,
          rowIndex: rowIndex,
          quiet: true
        });

        if (this.getRowSelection("checkOnSelect") === true) {
          nextState.selectedRowKeys = nextKeys;
          nextState.selectedRows = nextRows;
        }
      }

      this.setState(nextState);
    }

    return {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    };
  }

  /** 移除复选行 */
  removeChecked(key, rowIndex, rowData, quiet = false) {
    let {
      checkedKeys,
      checkedRows,
      rowKey,
      flatData,
      halfCheckedKeys,
      treeProps
    } = this.state;

    if (this.isSingleSelect()) {
      checkedKeys = [];
      checkedRows = [];
    } else if (!this.isMultipleSelect()) {
      return {
        keys: checkedKeys,
        rows: checkedRows,
        halfKeys: halfCheckedKeys
      };
    }

    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = removeCheckedKey({
      key,
      treeProps,
      selectedRowKeys: checkedKeys,
      rowKey,
      flatData,
      halfCheckedKeys
    });

    let nextRows = filterDataByKeys(
      flatData.concat(checkedRows),
      rowKey,
      nextKeys
    ).data;

    this.call_onUnCheck({
      rowData,
      rowIndex,
      rowKey: key,
      keys: nextKeys,
      rows: nextRows
    });

    this.call_onCheckChange({
      rowData,
      rowIndex,
      rowKey,
      keys: nextKeys,
      rows: nextRows
    });

    if (quiet === false) {
      let nextState = {
        checkedRows: nextRows,
        checkedKeys: nextKeys,
        halfCheckedKeys: nextHalflCheckedKeys
      };

      if (this.getRowSelection("selectOnCheck") === true) {
        this.removeSelected({
          rowKey: key,
          rowData: rowData,
          rowIndex: rowIndex,
          quiet: true
        });

        if (this.getRowSelection("checkOnSelect") === true) {
          nextState.selectedRowKeys = nextKeys;
          nextState.selectedRows = nextRows;
        }
      }
      this.setState(nextState);
    }

    return {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    };
  }

  onBeforeCheckAll = selected => {
    let { selectedRows, selectedRowKeys } = this.state;

    let bl = this.call_onBeforeCheckAll({
      selected,
      selectedRows,
      selectedRowKeys,
      checkAll: this.addAllChecked,
      unCheckAll: this.removeAllChecked
    });

    return bl;
  };

  onCheckAllChange = (selected, value, { indeterminate }) => {
    let bl = this.onBeforeCheckAll(selected);

    if (bl === false) {
      return;
    }
    if (indeterminate === true && this.state.disabledCheckedKeys.length > 0) {
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
    let { rowKey, checkedKeys, checkedRows, flatData } = this.state;

    let currKeys = checkedKeys.slice();

    flatData.forEach(d => {
      let k = d[rowKey];

      let bl = !this.isDisabledCheck(k, d);

      if (bl) {
        currKeys.push(k);
      }
    });

    let { changedKeys, changedRows } = getSelectionChanged({
      keyField: rowKey,
      selectedRowKeys: checkedKeys,
      data: flatData,
      triggerKeys: currKeys,
      selected: true
    });

    let nextKeys = checkedKeys.slice().concat(changedKeys);
    let nextRows = checkedRows.slice().concat(changedRows);

    let nextState = {
      checkedRows: nextRows,
      checkedKeys: nextKeys,
      halfCheckedKeys: []
    };

    this.call_onCheckAll({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      keys: nextKeys,
      rows: nextRows,
      changed: changedRows
    });

    this.call_onCheckChange({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      keys: nextKeys,
      rows: nextRows
    });

    if (this.getRowSelection("selectOnCheck") === true) {
      let {
        keys: nextSelectedRowKeys,
        rows: nextSelectedRows
      } = this.addAllSelected({
        keys: nextKeys,
        rows: nextRows,
        changedRows: changedRows,
        quiet: true
      });
      nextState.selectedRowKeys = nextSelectedRowKeys;
      nextState.selectedRows = nextSelectedRows;
    }

    this.setState(nextState);
  };

  /** 移除当前显示的所有数据 */
  removeAllChecked = () => {
    let { flatData, checkedKeys, checkedRows, rowKey } = this.state;

    let nextKeys = removeKeysByData(checkedKeys, rowKey, flatData);

    let nextRows = filterDataByKeys(
      flatData.concat(checkedRows),
      rowKey,
      nextKeys
    ).data;

    let nextState = {
      checkedRows: nextRows,
      checkedKeys: nextKeys,
      halfCheckedKeys: []
    };

    this.call_onUnCheckAll({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      keys: nextKeys,
      rows: nextRows,
      changed: flatData
    });

    this.call_onCheckChange({
      rowData: null,
      rowIndex: -1,
      rowKey: "",
      keys: nextKeys,
      rows: nextRows
    });

    if (this.getRowSelection("selectOnCheck") === true) {
      let {
        keys: nextSelectedRowKeys,
        rows: nextSelectedRows
      } = this.removeAllSelected({
        keys: nextKeys,
        rows: nextRows,
        changedRows: flatData,
        quiet: true
      });

      nextState.selectedRowKeys = nextSelectedRowKeys;
      nextState.selectedRows = nextSelectedRows;
    }

    this.setState(nextState);
  };

  checkboxCellRender = (value, rowData, index) => {
    let { rowKey, checkedKeys, selectedRowKeys, halfCheckedKeys } = this.state;

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

    if (checkedKeys.indexOf(key) > -1) {
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
                this.onCheckChange({
                  selected: !checked,
                  key: key,
                  index: index,
                  rowData: rowData
                });
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
    let { checkedKeys, halfCheckedKeys, flatData } = this.state;

    if (this.isSingleSelect()) {
      return null;
    }

    let isCheckedAll = true;

    let attr = {
      checked: false,
      indeterminate: false
    };

    isCheckedAll = this.isCheckedAll();

    if (flatData.length > 0) {
      if (isCheckedAll === true) {
        attr.checked = true;
      } else {
        if (checkedKeys.length > 0 || halfCheckedKeys.length > 0) {
          attr.indeterminate = true;
        }
      }
    }

    let SelectionTitle = this.getRowSelection("columnTitle");

    if (typeof SelectionTitle !== "undefined") {
      if (typeof SelectionTitle === "function") {
        return (
          <SelectionTitle
            checkAll={this.addAllChecked}
            unCheckAll={this.removeAllChecked}
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
      onClick: e => {
        this.onRowClick({ rowData, rowIndex });
        if (typeof o.onClick === "function") {
          o.onClick({ rowData, rowIndex, rowKey }, e);
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
    disabledCheckedKeys: PropTypes.array,
    selectedRowKeys: PropTypes.array,
    type: PropTypes.oneOf(["checkbox", "radio"]),
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSelectAll: PropTypes.func,
    showCheckbox: PropTypes.bool,
    onBeforeSelect: PropTypes.func,
    onBeforeCheckAll: PropTypes.func
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
