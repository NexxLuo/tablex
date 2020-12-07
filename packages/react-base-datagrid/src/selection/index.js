import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "../base";
import "./styles.css";
import Checkbox from "./Checkbox";
import {
  filterDataByKeys,
  removeKeysByData,
  getSelectionChanged,
  getRowSelectionFromProps,
  getSelectionConfigFromProps,
  addToCheckeds,
  removeCheckeds
} from "./utils";
import { AreaSelect } from "./Selector";

class SelectionGrid extends Component {
  constructor(props) {
    super(props);

    let areaSelectEnabled = getRowSelectionFromProps(
      props,
      "areaSelectEnabled"
    );

    if (areaSelectEnabled === true) {
      this.AreaSelector = new AreaSelect();
    }

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
        selectOnRowClick
      };

      if ("checkStrictly" in selectionProps) {
        nextState.checkStrictly = selectionProps.checkStrictly;
      }

      if ("selectedRowKeys" in selectionProps) {
        let { data: selectedData, keys } = filterDataByKeys(
          data.slice().concat(prevState.selectedRows),
          rowKey,
          selectionProps.selectedRowKeys
        );

        nextState.selectedRowKeys = keys;
        nextState.selectedRows = selectedData;
        if (selectedRowKeys.length === 0) {
          nextState.halfCheckedKeys = [];
        }
      }

      if ("checkedKeys" in selectionProps) {
        let { data: checkedData, keys } = filterDataByKeys(
          data.slice().concat(prevState.checkedRows),
          rowKey,
          selectionProps.checkedKeys
        );

        nextState.checkedKeys = keys;
        nextState.checkedRows = checkedData;
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

  // 添加rowSelection后，仍然执行tableprops.onSelect等事件的兼容性代码
  call_props_onSelect = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys
  }) => {
    let fn = this.props.onSelect;
    if (typeof fn === "function") {
      if (this.props.selectMode === "multiple") {
        fn(selectedRowKeys, selectedRows, rowKey, {
          rowIndex,
          rowData,
          halfKeys
        });
      } else {
        fn(rowData, rowIndex, rowKey, { rowData, rowIndex, halfKeys });
      }
    }
  };

  call_props_onUnSelect = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys
  }) => {
    let fn = this.props.onUnSelect;
    if (typeof fn === "function") {
      if (this.props.selectMode === "multiple") {
        fn(selectedRowKeys, selectedRows, rowKey, {
          rowIndex,
          rowData,
          halfKeys
        });
      } else {
        fn(rowData, rowIndex, rowKey, { rowData, rowIndex, halfKeys });
      }
    }
  };

  call_props_onSelectChange = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys
  }) => {
    let fn = this.props.onSelectChange;
    if (typeof fn === "function") {
      fn(selectedRowKeys, selectedRows, rowKey, {
        rowIndex,
        rowData,
        halfKeys
      });
    }
  };

  call_props_onSelectAll = ({ selectedRowKeys, selectedRows }) => {
    let fn = this.props.onSelectAll;
    if (typeof fn === "function") {
      fn(selectedRowKeys, selectedRows);
    }
  };

  call_props_onUnSelectAll = ({ selectedRowKeys, selectedRows }) => {
    let fn = this.props.onUnSelectAll;
    if (typeof fn === "function") {
      fn(selectedRowKeys, selectedRows);
    }
  };

  call_props_onBeforeSelect = params => {
    let fn = this.props.onBeforeSelect;
    if (typeof fn === "function") {
      return fn(params);
    }
  };

  call_props_onBeforeSelectAll = params => {
    let fn = this.props.onBeforeSelectAll;
    if (typeof fn === "function") {
      return fn(params);
    }
  };
  //

  call_onSelect = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys = []
  }) => {
    let rfn = this.getRowSelection("onSelect");
    if (typeof rfn === "function") {
      rfn(rowData, true, selectedRows, { halfKeys });
    }

    this.call_props_onSelect({
      rowData,
      rowIndex,
      rowKey,
      selectedRowKeys,
      selectedRows,
      halfKeys
    });
  };

  call_onUnSelect = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys = []
  }) => {
    let rfn = this.getRowSelection("onUnSelect");
    if (typeof rfn === "function") {
      rfn(rowData, false, selectedRows, { halfKeys });
    }

    this.call_props_onUnSelect({
      rowData,
      rowIndex,
      rowKey,
      selectedRowKeys,
      selectedRows,
      halfKeys
    });
  };

  call_onSelectChange = ({
    rowData,
    rowIndex,
    rowKey,
    selectedRowKeys,
    selectedRows,
    halfKeys = [],
    callPropsFn = true
  }) => {
    let rfn = this.getRowSelection("onSelectChange");
    if (typeof rfn === "function") {
      rfn(selectedRowKeys, selectedRows, { halfKeys });
    }

    if (callPropsFn) {
      this.call_props_onSelectChange({
        rowData,
        rowIndex,
        rowKey,
        selectedRowKeys,
        selectedRows,
        halfKeys
      });
    }
  };

  call_onSelectAll = ({ selectedRowKeys, selectedRows, changedRows }) => {
    let rfn = this.getRowSelection("onSelectAll");
    if (typeof rfn === "function") {
      rfn(true, selectedRows, changedRows);
    }
    this.call_props_onSelectAll({
      selectedRowKeys,
      selectedRows
    });
  };

  call_onUnSelectAll = ({ selectedRowKeys, selectedRows, changedRows }) => {
    let rfn = this.getRowSelection("onSelectAll");
    if (typeof rfn === "function") {
      rfn(false, selectedRows, changedRows);
    }

    this.call_props_onUnSelectAll({
      selectedRowKeys,
      selectedRows
    });
  };

  call_onBeforeSelect = params => {
    let rfn = this.getRowSelection("onBeforeSelect");
    if (typeof rfn === "function") {
      return rfn(params);
    } else {
      let bl = this.call_props_onBeforeSelect(params);
      if (bl === false) {
        return bl;
      }
    }
    return true;
  };

  //

  call_onCheck = ({ rowData, rows, halfKeys = [] }) => {
    let rfn = this.getRowSelection("onCheck");
    if (typeof rfn === "function") {
      rfn(rowData, true, rows, { halfKeys });
    }
  };

  call_onUnCheck = ({ rowData, rows, halfKeys = [] }) => {
    let rfn = this.getRowSelection("onCheck");
    if (typeof rfn === "function") {
      rfn(rowData, false, rows, { halfKeys });
    }
  };

  call_onBeforeCheck = params => {
    let rfn = this.getRowSelection("onBeforeCheck");
    if (typeof rfn === "function") {
      return rfn(params);
    }

    return true;
  };

  call_onCheckChange = ({
    rowData,
    rowIndex,
    rowKey,
    keys,
    rows,
    halfKeys = [],
    callPropsFn = true
  }) => {
    let rfn = this.getRowSelection("onCheckChange");
    let fn = this.getRowSelection("onChange");

    if (typeof rfn === "function") {
      rfn(keys, rows), { halfKeys };
    } else if (typeof fn === "function") {
      fn(keys, rows, { halfKeys });
    }

    if (callPropsFn === true) {
      this.call_props_onSelectChange({
        rowData,
        rowIndex,
        rowKey,
        selectedRowKeys: keys,
        selectedRows: rows,
        halfKeys
      });
    }
  };

  call_onCheckAll = ({ keys, rows, changed }) => {
    let rfn_c = this.getRowSelection("onCheckAll");
    if (typeof rfn_c === "function") {
      rfn_c(true, rows, changed);
    } else {
      this.call_props_onSelectAll({
        selectedRowKeys: keys,
        selectedRows: rows
      });
    }
  };

  call_onUnCheckAll = ({ keys, rows, changed }) => {
    let rfn_c = this.getRowSelection("onCheckAll");
    if (typeof rfn_c === "function") {
      rfn_c(false, rows, changed);
    } else {
      this.call_props_onUnSelectAll({
        selectedRowKeys: keys,
        selectedRows: rows
      });
    }
  };

  call_onBeforeCheckAll = params => {
    let rfn = this.getRowSelection("onBeforeCheckAll");
    if (typeof rfn === "function") {
      return rfn(params);
    } else {
      let bl = this.call_props_onBeforeSelectAll(params);
      if (bl === false) {
        return bl;
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
  isSingleCheck = () => {
    let type = this.getRowSelection("type");
    if (type) {
      return type === "radio";
    } else {
      return this.state.selectMode === "single";
    }
  };

  /** 是否为多选 */
  isMultipleCheck = () => {
    let type = this.getRowSelection("type");
    if (type) {
      return type === "checkbox";
    } else {
      return this.state.selectMode === "multiple";
    }
  };

  /** 点击行是否可选中 */
  isEnableSelect = () => {
    let selectType = this.getRowSelection("selectType");
    return selectType === "single" || selectType === "multiple";
  };

  /** 复选框模式是否启用 */
  isEnableCheck = () => {
    let type = this.getRowSelection("type");
    return type === "checkbox" || type === "radio";
  };

  /** 点击行是否为单选 */
  isSingleSelect = () => {
    if (this.hasRowSelection()) {
      let type = this.getRowSelection("type");
      let selectType = this.getRowSelection("selectType");
      let bl = false;

      if (type === "radio") {
        bl = true;
        if (selectType !== "single") {
          bl = false;
        }
      } else {
        if (selectType === "single") {
          bl = true;
        } else {
          bl = false;
        }
      }

      return bl;
    } else {
      return this.state.selectMode === "single";
    }
  };

  /** 点击行是否为多选 */
  isMultipleSelect = () => {
    if (this.hasRowSelection()) {
      let type = this.getRowSelection("type");
      let selectType = this.getRowSelection("selectType");

      let bl = false;

      if (type === "checkbox") {
        bl = true;
        if (selectType !== "multiple") {
          bl = false;
        }
      } else {
        if (selectType === "multiple") {
          bl = true;
        } else {
          bl = false;
        }
      }

      return bl;
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

  isCheckedAll = (excludes = []) => {
    let { checkedKeys, flatData, rowKey } = this.state;

    let keys = checkedKeys;

    if (flatData.length === 0 || keys.length === 0) {
      return false;
    }

    let bl = true;

    let selectedMap = {};

    for (let i = 0, len = keys.length; i < len; i++) {
      selectedMap[keys[i]] = true;
    }

    let excludesMap = {};

    for (let i = 0, len = excludes.length; i < len; i++) {
      excludesMap[excludes[i]] = true;
    }

    for (let i = 0, len = flatData.length; i < len; i++) {
      let dk = flatData[i][rowKey];
      if (excludesMap[dk] !== true && selectedMap[dk] !== true) {
        bl = false;
        break;
      }
    }

    return bl;
  };

  /** 移除选中行 */
  deleteSelected({ key, rowIndex, rowData }) {
    let {
      selectedRowKeys,
      selectedRows,
      rowKey,
      flatData,
      halfCheckedKeys,
      treeProps,
      checkStrictly
    } = this.state;

    let keys = selectedRowKeys.slice();
    let rows = selectedRows.slice();

    if (this.isSingleSelect()) {
      keys = [];
      rows = [];
    } else if (!this.isMultipleSelect()) {
      return {
        keys: keys,
        rows: rows
      };
    }

    let data = flatData.slice();
    let { includes: nextKeys } = removeCheckeds({
      keys: [key],
      treeProps: treeProps,
      prevIncludes: keys,
      prevHalf: halfCheckedKeys,
      excludeKeys: [],
      strictly: checkStrictly
    });

    let nextRows = filterDataByKeys(data.concat(rows), rowKey, nextKeys).data;

    return {
      keys: nextKeys,
      rows: nextRows
    };
  }

  addSelected = ({ rowKey, rowData, rowIndex, quiet = false }) => {
    let {
      selectedRowKeys,
      selectedRows,
      rowKey: keyField,
      halfCheckedKeys
    } = this.state;

    let nextKeys = selectedRowKeys.slice();
    let nextRows = selectedRows.slice();

    if (this.isSingleSelect()) {
      nextKeys = [rowKey];
      nextRows = [rowData];
    } else if (this.isMultipleSelect()) {
      let i = nextKeys.indexOf(rowKey);
      let j = nextRows.findIndex(d => d[keyField] === rowData[keyField]);

      if (i == -1) {
        nextKeys.push(rowKey);
      }
      if (j == -1) {
        nextRows.push(rowData);
      }
    }

    let nextState = {
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      halfCheckedKeys: halfCheckedKeys
    };

    if (quiet === false) {
      if (
        this.isEnableCheck() &&
        this.getRowSelection("checkOnSelect") === true
      ) {
        let {
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextHalfCheckedKeys
        } = this.insertChecked({ key: rowKey, rowData });

        if (this.isMultipleSelect()) {
          nextState.selectedRowKeys = nextCheckedKeys;
          nextState.selectedRows = nextCheckedRows;
        }

        nextState.checkedKeys = nextCheckedKeys;
        nextState.checkedRows = nextCheckedRows;
        nextState.halfCheckedKeys = nextHalfCheckedKeys;

        this.call_onCheck({
          rowData,
          rowIndex,
          rowKey: rowKey,
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextState.halfCheckedKeys
        });

        this.call_onCheckChange({
          rowData,
          rowIndex,
          rowKey: rowKey,
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextState.halfCheckedKeys,
          callPropsFn: false
        });
      }

      this.setState(nextState);

      this.call_onSelect({
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        rowKey,
        rowIndex,
        rowData,
        halfKeys: nextState.halfCheckedKeys
      });

      this.call_onSelectChange({
        rowData,
        rowIndex,
        rowKey,
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        halfKeys: nextState.halfCheckedKeys
      });
    }

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  removeSelected = ({ rowKey, rowData, rowIndex, quiet = false }) => {
    let {
      selectedRowKeys,
      selectedRows,
      rowKey: keyField,
      halfCheckedKeys
    } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);

    let nextKeys = selectedRowKeys.slice();
    let nextRows = selectedRows.slice();

    if (i > -1) {
      nextKeys.splice(i, 1);
      let j = nextRows.findIndex(d => d[keyField] === rowKey);
      if (j > -1) {
        nextRows.splice(j, 1);
      }
    }

    let nextState = {
      selectedRowKeys: nextKeys,
      selectedRows: nextRows,
      halfCheckedKeys: halfCheckedKeys
    };

    if (quiet === false) {
      if (
        this.isEnableCheck() &&
        this.getRowSelection("checkOnSelect") === true
      ) {
        let {
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextHalfCheckedKeys
        } = this.deleteChecked({ key: rowKey, rowIndex, rowData });

        nextState.checkedKeys = nextCheckedKeys;
        nextState.checkedRows = nextCheckedRows;
        nextState.halfCheckedKeys = nextHalfCheckedKeys;

        if (this.isMultipleSelect()) {
          nextState.selectedRowKeys = nextCheckedKeys;
          nextState.selectedRows = nextCheckedRows;
        }

        this.call_onUnCheck({
          rowData,
          rowIndex,
          rowKey: rowKey,
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextState.halfCheckedKeys
        });

        this.call_onCheckChange({
          rowData,
          rowIndex,
          rowKey: rowKey,
          keys: nextCheckedKeys,
          rows: nextCheckedRows,
          halfKeys: nextState.halfCheckedKeys,
          callPropsFn: false
        });
      }

      this.setState(nextState);

      this.call_onUnSelect({
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        rowKey,
        rowIndex,
        rowData,
        halfKeys: nextState.halfCheckedKeys
      });

      this.call_onSelectChange({
        rowData,
        rowIndex,
        rowKey,
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        halfKeys: nextState.halfCheckedKeys
      });
    }

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  addAllSelected = ({ keys, rows, changedRows, quiet = false }) => {
    let nextKeys = keys;
    let nextRows = rows;

    if (quiet === false) {
      this.call_onSelectAll({
        selectedRowKeys: nextKeys,
        selectedRows: nextRows,
        changedRows
      });

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
      this.call_onUnSelectAll({
        selectedRowKeys: nextKeys,
        selectedRows: nextRows,
        changedRows
      });

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

    if (!this.isEnableSelect()) {
      return;
    }

    if (selectOnRowClick === true) {
      this.onSelectChange(rowKey, rowData, rowIndex);
    }
  };

  /** single change */
  onSelectChange = (rowKey, rowData, rowIndex) => {
    let { selectedRowKeys } = this.state;
    let i = selectedRowKeys.indexOf(rowKey);
    let isSelected = i > -1;

    if (this.getRowSelection("selectInverted") === false) {
      if (isSelected) {
        return;
      }
    }

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

    if (bl !== false) {
      if (
        this.isEnableCheck() &&
        this.getRowSelection("checkOnSelect") === true
      ) {
        bl = this.onBeforeCheck({
          selected: isSelected,
          rowData,
          index: rowIndex,
          key: rowKey,
          callback: () => {
            if (isSelected) {
              this.removeChecked(rowKey, rowIndex, rowData);
            } else {
              this.addChecked(rowKey, rowIndex, rowData);
            }
          }
        });
      }
    }

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

    if (bl !== false) {
      if (
        this.isEnableSelect() &&
        this.getRowSelection("selectOnCheck") === true
      ) {
        bl = this.onBeforeSelect({
          selected: isSelected,
          rowData,
          index: index,
          key: key,
          callback: () => {
            if (isSelected) {
              this.removeSelected({ rowKey: key, rowData, rowIndex: index });
            } else {
              this.addSelected({ rowKey: key, rowData, rowIndex: index });
            }
          }
        });
      }
    }

    if (bl === false) {
      return;
    }

    if (selected === true) {
      this.removeChecked(key, index, rowData);
    } else {
      this.addChecked(key, index, rowData);
    }
  };

  insertChecked({ key, rowData }) {
    let {
      checkedKeys,
      checkedRows,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledCheckedKeys,
      treeProps,
      checkStrictly
    } = this.state;

    if (this.isSingleCheck()) {
      checkedKeys = [key];
      checkedRows = [rowData];
    } else if (!this.isMultipleCheck()) {
      return {
        keys: checkedKeys,
        rows: checkedRows,
        halfKeys: halfCheckedKeys
      };
    }

    let data = flatData.slice();

    let { includes: nextKeys, halfKeys: nextHalflCheckedKeys } = addToCheckeds({
      keys: [key],
      treeProps: treeProps,
      strictly: checkStrictly,
      prevIncludes: checkedKeys,
      prevHalf: halfCheckedKeys,
      excludeKeys: disabledCheckedKeys
    });

    //记录上一次选中的行数据，避免翻页情况下的数据丢失
    let nextRows = filterDataByKeys(data.concat(checkedRows), rowKey, nextKeys)
      .data;

    return {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    };
  }

  /** 移除复选行 */
  deleteChecked({ key }) {
    let {
      checkedKeys,
      checkedRows,
      rowKey,
      flatData,
      halfCheckedKeys,
      treeProps,
      checkStrictly
    } = this.state;

    if (this.isSingleCheck()) {
      checkedKeys = [];
      checkedRows = [];
    } else if (!this.isMultipleCheck()) {
      return {
        keys: checkedKeys,
        rows: checkedRows,
        halfKeys: halfCheckedKeys
      };
    }

    let data = flatData.slice();

    let { includes: nextKeys, halfKeys: nextHalflCheckedKeys } = removeCheckeds(
      {
        keys: [key],
        treeProps: treeProps,
        prevIncludes: checkedKeys,
        prevHalf: halfCheckedKeys,
        excludeKeys: [],
        strictly: checkStrictly
      }
    );

    let nextRows = filterDataByKeys(data.concat(checkedRows), rowKey, nextKeys)
      .data;

    return {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    };
  }

  /** 添加复选行 */
  addChecked(key, rowIndex, rowData, quiet = false) {
    if (this.AreaSelector) {
      if (this.AreaSelector.hasShiftKeyDown() === true) {
        this.endAreaSelect(rowIndex, true);
        this.AreaSelector.beginShift(rowIndex);
        return;
      }
      this.AreaSelector.beginShift(rowIndex);
    }

    let {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    } = this.insertChecked({ key, rowData });

    this.call_onCheck({
      rowData,
      rowIndex,
      rowKey: key,
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    });

    this.call_onCheckChange({
      rowData,
      rowIndex,
      rowKey: key,
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    });

    let nextState = {
      checkedRows: nextRows,
      checkedKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys,
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows
    };

    if (
      this.isEnableSelect() &&
      this.getRowSelection("selectOnCheck") === true
    ) {
      let { keys: nextSelectedKeys, rows: nextSelectedRows } = this.addSelected(
        {
          rowKey: key,
          rowData: rowData,
          rowIndex: rowIndex,
          quiet: true
        }
      );

      if (this.isMultipleSelect()) {
        nextState.selectedRowKeys = nextKeys;
        nextState.selectedRows = nextRows;
      } else {
        nextState.selectedRowKeys = nextSelectedKeys;
        nextState.selectedRows = nextSelectedRows;
      }

      this.call_onSelect({
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        rowKey: key,
        rowIndex,
        rowData,
        halfKeys: nextHalflCheckedKeys
      });

      this.call_onSelectChange({
        rowData,
        rowIndex,
        rowKey: key,
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        halfKeys: nextHalflCheckedKeys,
        callPropsFn: false
      });
    }

    this.setState(nextState);

    return {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    };
  }

  /** 移除复选行 */
  removeChecked(key, rowIndex, rowData, quiet = false) {
    let {
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    } = this.deleteChecked({ key, rowIndex, rowData });

    this.call_onUnCheck({
      rowData,
      rowIndex,
      rowKey: key,
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    });

    this.call_onCheckChange({
      rowData,
      rowIndex,
      rowKey: key,
      keys: nextKeys,
      rows: nextRows,
      halfKeys: nextHalflCheckedKeys
    });

    let nextState = {
      checkedRows: nextRows,
      checkedKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys,
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows
    };

    if (
      this.isEnableSelect() &&
      this.getRowSelection("selectOnCheck") === true
    ) {
      let {
        keys: nextSelectedKeys,
        rows: nextSelectedRows
      } = this.removeSelected({
        rowKey: key,
        rowData: rowData,
        rowIndex: rowIndex,
        quiet: true
      });

      if (this.isMultipleSelect()) {
        nextState.selectedRowKeys = nextKeys;
        nextState.selectedRows = nextRows;
      } else {
        nextState.selectedRowKeys = nextSelectedKeys;
        nextState.selectedRows = nextSelectedRows;
      }

      //   nextState.selectedRowKeys = nextSelectedKeys;
      // nextState.selectedRows = nextSelectedRows;

      this.call_onUnSelect({
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        rowKey: key,
        rowIndex,
        rowData,
        halfKeys: nextHalflCheckedKeys
      });

      this.call_onSelectChange({
        rowData,
        rowIndex,
        rowKey: key,
        selectedRowKeys: nextState.selectedRowKeys,
        selectedRows: nextState.selectedRows,
        halfKeys: nextHalflCheckedKeys,
        callPropsFn: false
      });
    }
    this.setState(nextState);

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

  onCheckAllChange = selected => {
    let bl = this.onBeforeCheckAll(selected);

    if (bl === false) {
      return;
    }

    if (selected === true) {
      this.removeAllChecked();
    } else {
      let hasCheckedAll = this.isCheckedAll(this.state.disabledCheckedKeys);

      if (hasCheckedAll === true) {
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

    if (
      this.isEnableSelect() &&
      this.getRowSelection("selectOnCheck") === true
    ) {
      if (this.isMultipleSelect()) {
        let {
          keys: nextSelectedRowKeys,
          rows: nextSelectedRows
        } = this.addAllSelected({
          keys: nextKeys,
          rows: nextRows,
          changedRows: changedRows
        });
        nextState.selectedRowKeys = nextSelectedRowKeys;
        nextState.selectedRows = nextSelectedRows;
      }
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

    if (
      this.isEnableSelect() &&
      this.getRowSelection("selectOnCheck") === true
    ) {
      let {
        keys: nextSelectedRowKeys,
        rows: nextSelectedRows
      } = this.removeAllSelected({
        keys: nextKeys,
        rows: nextRows,
        changedRows: flatData
      });

      nextState.selectedRowKeys = nextSelectedRowKeys;
      nextState.selectedRows = nextSelectedRows;
    }

    this.setState(nextState);
  };

  endAreaSelect = (rowIndex, isShift) => {
    if (!this.AreaSelector) {
      return;
    }
    let { rowKey: keyField, data } = this.state;
    let areaKeys = [];
    if (isShift === true) {
      areaKeys = this.AreaSelector.endShift(data, rowIndex, keyField);
    } else {
      areaKeys = this.AreaSelector.endWithIndex(data, rowIndex, keyField);
    }
    if (areaKeys.length > 0) {
      let {
        flatData,
        checkedRows,
        checkedKeys,
        halfCheckedKeys,
        rowKey,
        treeProps,
        disabledCheckedKeys,
        checkStrictly
      } = this.state;

      let { includes, halfKeys } = addToCheckeds({
        treeProps: treeProps,
        strictly: checkStrictly,
        prevHalf: halfCheckedKeys,
        keys: areaKeys,
        prevIncludes: checkedKeys,
        excludeKeys: disabledCheckedKeys
      });

      let { data, keys } = filterDataByKeys(
        flatData.slice().concat(checkedRows),
        rowKey,
        includes
      );

      if (
        this.isMultipleSelect() &&
        this.getRowSelection("selectOnCheck") === true
      ) {
        this.setState(
          {
            checkedKeys: keys,
            checkedRows: data,
            halfCheckedKeys: halfKeys,
            selectedRowKeys: keys.slice(),
            selectedRows: data.slice()
          },
          () => {
            this.call_onCheckChange({
              rowData: null,
              rowIndex: -1,
              rowKey: "",
              keys: keys,
              rows: data
            });
            this.call_onSelectChange({
              rowData: null,
              rowIndex: -1,
              rowKey: "",
              selectedRowKeys: keys,
              selectedRows: data
            });
          }
        );
      } else {
        this.setState(
          {
            checkedKeys: keys,
            checkedRows: data,
            halfCheckedKeys: halfKeys
          },
          () => {
            this.call_onCheckChange({
              rowData: null,
              rowIndex: -1,
              rowKey: "",
              keys: keys,
              rows: data
            });
          }
        );
      }
    }
  };

  onCheckboxCell = (row, index, extra = {}) => {
    let key = extra.key;
    return {
      onMouseDown: e => {
        this.AreaSelector && this.AreaSelector.beginWithIndex(e, key, index);
      },
      onContextMenu: e => {
        e.preventDefault();
      }
    };
  };

  checkboxCellRender = (value, rowData, index) => {
    let { rowKey, checkedKeys, halfCheckedKeys } = this.state;

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
          this.onCheckChange({
            selected: checked,
            key: ck,
            index: index,
            rowData: rowData
          });
        }}
      />
    );
  };

  checkboxHeadRender = () => {
    let { checkedKeys, halfCheckedKeys, flatData } = this.state;

    if (this.isSingleCheck()) {
      return null;
    }

    let isCheckedAll = true;

    let attr = {
      checked: false,
      indeterminate: false
    };

    isCheckedAll = this.isCheckedAll(this.state.disabledCheckedKeys);

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
          <SelectionTitle onChange={this.onCheckAllChange}></SelectionTitle>
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
        this.onRowClick({ rowData, rowIndex });
        if (typeof o.onClick === "function") {
          o.onClick({ rowData, rowIndex, rowKey }, e);
        }
      },
      onMouseUp: e => {
        this.endAreaSelect(rowIndex);
        if (typeof o.onMouseUp === "function") {
          o.onMouseUp(e);
        }
      }
    };
  };

  getDataByKeys = (keys, data, keyField) => {
    let keysMap = {};

    let matched = [];

    keys.forEach(k => {
      keysMap[k] = true;
    });

    data.forEach(d => {
      if (keysMap[d[keyField]]) {
        matched.push(d);
      }
    });

    return matched;
  };

  selectAll = silent => {
    let { flatData, rowKey } = this.state;

    let nextKeys = [];

    for (let i = 0; i < flatData.length; i++) {
      nextKeys.push(flatData[i][rowKey]);
    }

    if (silent === false) {
      this.addAllSelected({
        keys: nextKeys,
        rows: flatData,
        changedRows: [],
        quiet: false
      });
    }

    return nextKeys;
  };

  unSelectAll = silent => {
    if (silent === false) {
      this.removeAllSelected({
        keys: [],
        rows: [],
        changedRows: [],
        quiet: false
      });
    }
    return [];
  };

  selectToggle = (row, silent = false) => {
    let { rowKey, selectedRowKeys, flatData, treeProps } = this.state;

    let keys = selectedRowKeys;

    let keysMap = {};

    let nextKeys = [];
    let nextRows = [];

    if (row) {
      let triggerKey = row[rowKey];

      let isExist = keys.indexOf(triggerKey) > -1;

      let childrenKeys = [];

      let treeNode = treeProps[triggerKey];

      if (treeNode) {
        childrenKeys = treeNode.childrens || [];
      }

      //已选中的行key
      for (let i = 0; i < keys.length; i++) {
        keysMap[keys[i]] = true;
      }
      if (isExist) {
        keysMap[triggerKey] = false;
      } else {
        keysMap[triggerKey] = true;
      }

      //当前子级key
      for (let i = 0; i < childrenKeys.length; i++) {
        const k = childrenKeys[i];
        if (isExist) {
          keysMap[k] = false;
        } else {
          keysMap[k] = true;
        }
      }

      for (const d in keysMap) {
        if (keysMap[d] === true) {
          nextKeys.push(d);
        }
      }
    }

    if (silent === false) {
      nextRows = this.getDataByKeys(nextKeys, flatData, rowKey);
      this.setState(
        {
          selectedRowKeys: nextKeys,
          selectedRows: nextRows
        },
        () => {
          this.call_onSelectChange({
            rowData: null,
            rowIndex: -1,
            rowKey: "",
            selectedRowKeys: nextKeys,
            selectedRows: nextRows,
            halfKeys: this.state.halfCheckedKeys
          });
        }
      );
    }
    return nextKeys;
  };

  getSelections = () => {
    let { selectedRowKeys, flatData, rowKey } = this.state;
    let rows = this.getDataByKeys(selectedRowKeys, flatData, rowKey);

    return {
      keys: selectedRowKeys,
      data: rows
    };
  };

  actions = {
    selectAll: this.selectAll.bind(this),
    unSelectAll: this.unSelectAll.bind(this),
    selectToggle: this.selectToggle.bind(this),
    getSelections: this.getSelections.bind(this)
  };

  componentDidMount() {
    let o = this.props.actions;

    if (o && typeof o === "object") {
      let actions = this.actions;
      for (const k in actions) {
        o[k] = actions[k];
      }
    }
  }

  render() {
    let { columns, prependColumns } = this.state;
    let props = this.props;

    let checkboxColumn = prependColumns.find(
      d => d.__type === "__checkbox_column"
    );

    if (checkboxColumn) {
      checkboxColumn.render = this.checkboxCellRender;
      checkboxColumn.title = this.checkboxHeadRender;
      checkboxColumn.onCell = this.onCheckboxCell;
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
    areaSelectEnabled: PropTypes.bool,
    checkStrictly: PropTypes.bool,
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
    selectType: PropTypes.oneOf(["single", "multiple", "none"]),
    selectInverted: PropTypes.bool,
    type: PropTypes.oneOf(["checkbox", "radio", "none"]),
    showCheckbox: PropTypes.bool,
    selectOnCheck: PropTypes.bool,
    checkOnSelect: PropTypes.bool,
    onBeforeSelect: PropTypes.func,
    onSelect: PropTypes.func,
    onSelectAll: PropTypes.func,
    onCheck: PropTypes.func,
    onBeforeCheck: PropTypes.func,
    onBeforeCheckAll: PropTypes.func,
    onCheckAll: PropTypes.func,
    onChange: PropTypes.func
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
  checkStrictly: PropTypes.bool,

  /** actions注册 */
  actions: PropTypes.object
};

export default SelectionGrid;
