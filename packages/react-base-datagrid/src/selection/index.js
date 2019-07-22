import React, { Component } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
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
      columns: [],
      prependColumns: [],
      rowHeight: 40,
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
      rowHeight,
      selectMode,
      rowSelectClassName,
      checkStrictly,
      flatData,
      selectedRowKeys,
      disabledSelectKeys,
      prependColumns=[]
    } = nextProps;

    let nextState = {};

    if (prevState.prevProps !== nextProps) {
      let extraColumns = [];

      if (selectMode === "multiple") {
        extraColumns.unshift({
          key: "__checkbox_column",
          dataKey: "__checkbox_column",
          __type: "__checkbox_column",
          resizable: false,
          width: 50,
          align: "center"
        });
      }


      nextState = {
        rowKey,
        data: data,
        flatData: flatData,
        columns: columns,
        prependColumns: extraColumns.concat(prependColumns),
        rowHeight,
        prevProps: nextProps,
        selectMode,
        rowSelectClassName,
        checkStrictly
      };

      if ("selectedRowKeys" in nextProps) {
        nextState.selectedRowKeys = selectedRowKeys;
      }

      if ("disabledSelectKeys" in nextProps) {
        nextState.disabledSelectKeys = disabledSelectKeys;
      }
    }

    return nextState;
  }

  /** 通过rowKey获取数据行 */
  getRowsByKeys = (keys = []) => {
    let rows = [];
    let { rowKey, flatData: arr } = this.state;

    keys.forEach(k => {
      let row = arr.find(r => r[rowKey] === k);
      if (row != null) {
        rows.push(Object.assign({}, row));
      }
    });

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
      } else {
        nextKeys.push(rowKey);
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
      let parentKeys = rowData.__parents || [];

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

  /** 添加复选行 */
  addChecked(key) {
    let {
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledSelectKeys
    } = this.state;

    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = addCheckedKeyWithDisabled({
      key,
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys,
      disabledSelectKeys
    });

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextKeys, this.getRowsByKeys(nextKeys), rowKey);
    }

    this.setState({
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys,
      data: cloneDeep(this.state.data)
    });
  }

  /** 移除复选行 */
  removeChecked(key) {
    let { selectedRowKeys, rowKey, flatData, halfCheckedKeys } = this.state;

    let {
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys
    } = removeCheckedKey({
      key,
      selectedRowKeys,
      rowKey,
      flatData,
      halfCheckedKeys
    });

    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(nextKeys, this.getRowsByKeys(nextKeys), rowKey);
    }

    this.setState({
      selectedRowKeys: nextKeys,
      halfCheckedKeys: nextHalflCheckedKeys,
      data: cloneDeep(this.state.data)
    });
  }

  onCheckAllChange = bl => {
    if (bl === true) {
      this.addAllChecked();

      if (typeof this.props.onSelectAll === "function") {
        this.props.onSelectAll();
      }
    } else {
      this.removeAllChecked();

      if (typeof this.props.onUnSelectAll === "function") {
        this.props.onUnSelectAll();
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

    this.setState({
      selectedRowKeys: nextSelected,
      halfCheckedKeys: [],
      data: cloneDeep(this.state.data)
    });
  };

  removeAllChecked = () => {
    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange([], [], "");
    }

    this.setState({
      selectedRowKeys: [],
      halfCheckedKeys: [],
      data: cloneDeep(this.state.data)
    });
  };

  checkboxCellRender = (value, rowData, index) => {
    let { rowKey, selectedRowKeys, halfCheckedKeys } = this.state;
    let key = rowData[rowKey];

    let attr = {};

    if (selectedRowKeys.indexOf(key) > -1) {
      attr.checked = true;
    }

    if (halfCheckedKeys.indexOf(key) > -1) {
      attr.indeterminate = true;
    }

    if (this.isDisabledCheck(key, rowData)) {
      attr.disabled = true;
    }
    return (
      <Checkbox
        rowData={rowData}
        value={key}
        onChange={this.onCheckChange}
        {...attr}
      />
    );
  };

  checkboxHeadRender = () => {
    let { selectedRowKeys, halfCheckedKeys, flatData, rowKey } = this.state;

    let isCheckedAll = true;

    let attr = {};

    if (flatData.length > 0) {
      if (selectedRowKeys.length === 0) {
        isCheckedAll = false;
      }

      for (let i = 0; i < flatData.length; i++) {
        const key = flatData[i][rowKey];

        if (this.isDisabledCheck(key, flatData[i])) {
          continue;
        }

        if (selectedRowKeys.indexOf(key) === -1) {
          isCheckedAll = false;
          break;
        }
      }

      if (isCheckedAll === true) {
        attr.checked = true;
      } else {
        if (selectedRowKeys.length > 0 || halfCheckedKeys.length > 0) {
          attr.indeterminate = true;
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

  onRow = (rowData, rowIndex) => {
    let fn = this.props.onRow;

    let o = {};
    if (typeof fn === "function") {
      o = fn(rowData, rowIndex);
    }

    return {
      ...o,
      onClick: () => {
        let { selectedRowKeys, rowKey: key } = this.state;
        let rowKey = rowData[key];

        if (this.isSingleSelect()) {
          this.onSelectChange(rowKey, rowData, rowIndex);
        }

        if (this.isMultipleSelect()) {
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

    let expandColumnKey = props.expandColumnKey;
    if (!expandColumnKey && props.columns.length > 0) {
      expandColumnKey = props.columns[0].key;
    }

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
      expandColumnKey,
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
  rowSelectClassName: "tablex__row--selected"
};

SelectionGrid.propTypes = {
  /** 行选中时的样式类名 */
  rowSelectClassName: PropTypes.string,
  /** 选择模式：多选 单选 不可选择 */
  selectMode: PropTypes.oneOf(["multiple", "single", "none"]),

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
