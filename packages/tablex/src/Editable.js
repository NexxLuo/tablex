import React, { Fragment } from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import Table from "./Table";
import Editor from "./components/Editor";
import Validator from "./components/Validator";
import {
  treeToFlatten,
  treeToList,
  treeFilter,
  getTreeFromFlatData,
  cloneData,
  insertData,
  deleteData,
  distinctData
} from "./utils";

import { message, Button, Popconfirm, Menu, Dropdown, Icon } from "./widgets";

import orderBy from "lodash/orderBy";
import "./styles.css";

/**
 * 表格
 */
class EditableTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rowKey: props.rowKey,
      prevProps: {},
      rawColumns: [],
      columns: [],
      columnList: [],
      data: [],
      flatData: [],
      sourceData: [],
      rawData: [],
      changedRows: [],
      isEditAll: false,
      isAdding: false,
      isAddingRange: false,
      isEditing: false,
      isAppend: false,
      editKeys: [],
      editSaveLoading: false,
      deleteLoading: false,
      dataControled: false,
      readOnly: false,
      selectedRowKeys: [],
      selectedRows: [],
      expandedRowKeys: [],
      focusedRowKeys: [],
      columnOptions: {}
    };
  }

  rowsAttribute = [];

  isEditing = () => {
    return this.state.isEditing;
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let nextState = {
        prevProps: nextProps,
        dataControled: nextProps.dataControled || false,
        readOnly: nextProps.readOnly,
        rawColumns: nextProps.columns || [],
        isAppend: nextProps.isAppend,
        columnOptions: nextProps.columnOptions || {}
      };

      //处理编辑状态受控

      if ("editKeys" in nextProps || "editAll" in nextProps) {
        let nextIsEditing = false;
        let nextEditKeys = nextProps.editKeys || [];
        let nextIsEditAll = !!nextProps.editAll;

        if (nextIsEditAll === true || nextEditKeys.length > 0) {
          nextIsEditing = true;
        }

        nextState.editKeys = nextEditKeys;
        nextState.isEditAll = nextIsEditAll;
        nextState.isEditing = nextIsEditing;
        nextState.isControledEdit = true;
      }
      //

      if ("expandedRowKeys" in nextProps) {
        nextState.expandedRowKeys = nextProps.expandedRowKeys;
      }

      if ("selectedRowKeys" in nextProps) {
        nextState.selectedRowKeys = nextProps.selectedRowKeys;
      }

      let columnList = [];

      //给列key设置缺省值
      let columns = treeFilter(
        cloneDeep(nextProps.columns || []),
        (d, i, { depth, treeIndex }) => {
          if (!d.key) {
            d.key = d.dataIndex || depth + "-" + i + "-" + treeIndex;
          }

          //控制编辑器可见权限
          let visible = true;
          let options = nextState.columnOptions[d.key] || {};
          if (options.visible === false) {
            visible = false;
          }
          //

          if (visible === true) {
            columnList.push(d);
            return true;
          }
          return false;
        }
      );
      //

      nextState.columns = columns;
      nextState.columnList = columnList;

      nextState.changedRows = [];

      let data = nextProps.data || nextProps.dataSource || [];

      if (prevState.dataControled === true) {
        let flatData = treeToFlatten(data).list;
        nextState.rawData = data;
        nextState.flatData = flatData;
        nextState.data = data;
        nextState.sourceData = cloneData(data);
      } else {
        if (prevState.rawData !== data) {
          nextState.rawData = data;
          let flatData = treeToFlatten(data).list;
          nextState.flatData = flatData;
          nextState.data = data;
          nextState.sourceData = cloneData(data);
        }
      }

      return nextState;
    }

    return null;
  }

  innerTable = null;

  innerTableRef = ins => {
    this.innerTable = ins;
    if (typeof this.props.innerRef === "function") {
      this.props.innerRef(ins);
    }
  };

  getDataList = () => {
    let arr = [];
    if (this.innerTable) {
      arr = this.innerTable.state.data;
    }
    return arr;
  };

  resetAfterIndex(index, shouldForceUpdate) {
    if (this.innerTable) {
      this.innerTable.resetAfterIndex(index, shouldForceUpdate);
    }
  }

  scrollToItem(index, align) {
    if (this.innerTable) {
      this.innerTable.scrollToItem(index, align);
    }

    if (index < 0) {
      this.setState({ focusedRowKeys: [] });
    }
  }

  /** align: auto、smart、center、end、start */
  scrollToRow(key, align) {
    if (this.innerTable) {
      this.innerTable.scrollToRow(key, align);
    }
  }

  updateComponent = () => {
    this.forceUpdate();
  };

  delayTimer = null;
  delayUpdate = fn => {
    let delay = 300;

    if (typeof this.props.validateDelay === "number") {
      delay = this.props.validateDelay;
    }

    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
    }

    if (typeof fn === "function") {
      this.delayTimer = setTimeout(() => {
        fn();
        this.updateComponent();
      }, delay);
    } else {
      this.delayTimer = setTimeout(this.updateComponent, delay);
    }
  };

  isMouseFocus = false;

  changedRows = [];
  addToChanged = rowsMap => {
    let rowKey = this.props.rowKey;
    let nextChangedRows = this.changedRows.slice();

    let changedRowsKeyMap = {};
    nextChangedRows.forEach(d => {
      changedRowsKeyMap[d[rowKey]] = true;
    });

    for (const key in rowsMap) {
      if (changedRowsKeyMap[key] !== true) {
        nextChangedRows.push(rowsMap[key]);
      }
    }

    this.changedRows = nextChangedRows;
  };

  editChange = (data = {}, row) => {
    let newValues = [];

    if (data instanceof Array) {
      newValues = data;
    } else {
      let r = Object.assign({}, row, data);
      newValues = [r];
    }

    let modifiedData = this.modifyData(newValues, true);

    // 当change时立即验证行
    if (this.props.validateTrigger === "onChange") {
      this.validateRows(modifiedData);
      this.updateComponent();
    }
  };

  setRowAttr = (row, attr = {}) => {
    let rowKey = this.props.rowKey;
    let key = row[rowKey];

    let attrs = this.rowsAttribute || [];

    let i = attrs.findIndex(d => d["rowKey"] === key);

    if (i > -1) {
      let fRow = attrs[i];

      if (typeof fRow.attribute === "undefined") {
        fRow.attribute = attr;
      } else {
        fRow.attribute = merge({}, fRow.attribute, attr);
      }
    } else {
      let newAttr = Object.assign({}, { rowKey: key });
      newAttr.attribute = attr;
      attrs.push(newAttr);
    }

    this.rowsAttribute = attrs;
  };

  getRowAttr = row => {
    let rowKey = this.props.rowKey;
    let key = row[rowKey];

    let attrs = this.rowsAttribute || [];
    let attr = {};

    let i = attrs.findIndex(d => d["rowKey"] === key);
    if (i > -1) {
      attr = attrs[i] || {};
    }

    return Object.assign({}, attr.attribute || {});
  };

  getValidate = (row, key) => {
    let attr = this.getRowAttr(row);
    let r = (attr["validation"] || {})[key] || {};

    return r;
  };

  clearValidate = row => {
    let { columnList: columns } = this.state;
    let validation = {};
    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      const ck = c.key;
      validation[ck] = {
        valid: true,
        msg: ""
      };
    }
    this.setRowAttr(row, {
      validation
    });
  };

  clearValidation = quiet => {
    this.rowsAttribute = [];
    if (quiet !== true) {
      this.forceUpdate();
    }
  };

  //进行异步验证的promise
  validatorAsync = [];

  validateRow = row => {
    let { columnList: columns, columnOptions } = this.state;

    let bl = true;

    let validation = {};

    if (
      this.props.ignoreEmptyRow === true &&
      this.editType === "add" &&
      this.isEmptyRow(row)
    ) {
      this.clearValidate(row);
      return true;
    }

    let validateNoEditting = this.props.validateNoEditting;

    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      const ck = c.key;

      let enabledValidate = false;
      let hasEditor = typeof c.editor === "function";
      let hasValidator = typeof c.validator === "function";

      if (validateNoEditting === true) {
        enabledValidate = hasValidator;
      } else {
        enabledValidate = hasValidator && hasEditor;
      }

      //根据编辑器配置进行前置必填验证
      let options = columnOptions[ck] || {};
      if (options.required === true) {
        let rv = row[ck];
        if (rv === undefined || rv === null || rv === "") {
          validation[ck] = {
            valid: false,
            msg: this.props.intl["editorRequiredError"]
          };

          this.setRowAttr(row, {
            validation
          });
          return false;
        }
      }
      //

      if (enabledValidate) {
        var v = c.validator(row[ck], row) || { valid: true, message: "" };

        if (v && v.constructor.name === "Promise") {
          this.validatorAsync.push(
            new Promise((resolve, reject) => {
              v.then(d => {
                resolve({ validation: d, row, columnKey: ck });
              });

              v.catch(e => {
                reject(e);
              });
            })
          );
        } else {
          validation[ck] = {
            valid: v.valid,
            msg:
              v.message === null
                ? ""
                : v.message || this.props.intl["editorInputError"]
          };

          if (!v.valid) bl = false;

          this.setRowAttr(row, {
            validation
          });
        }
      }
    }

    return bl;
  };

  validateRows = (rows = []) => {
    for (let i = 0; i < rows.length; i++) {
      this.validateRow(rows[i]);
    }
  };

  //异步验证数据行
  validateAsync = rows => {
    let arr = rows || [];

    return new Promise((resolve, reject) => {
      let bl = true;

      for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        let temp = this.validateRow(r);
        if (temp === false) {
          bl = false;
        }
      }

      if (this.validatorAsync.length > 0) {
        Promise.all(this.validatorAsync).then(datas => {
          datas.forEach(d => {
            let v = d.validation;

            if (v.valid === false) {
              bl = false;
            }

            let validation = {};

            validation[d.columnKey] = {
              valid: v.valid,
              msg: v.valid ? "" : v.message
            };

            this.setRowAttr(d.row, {
              validation
            });
          });

          this.validatorAsync = [];
          this.updateComponent();

          resolve(bl);
        });
      } else {
        if (arr.length > 0) {
          this.updateComponent();
        }

        resolve(bl);
      }
    });
  };

  call_onValidate = v => {
    let fn = this.props.onValidate;
    if (typeof fn === "function") {
      fn(v);
    }
  };

  //验证改变的数据行
  validate = async () => {
    let bl = true;
    let arr = this.getChangedRows();
    bl = await this.validateAsync(arr);
    this.call_onValidate(bl);
    return bl;
  };

  //判断行的列值是否都为空
  isEmptyRow = row => {
    let { columnList: columns, rowKey } = this.state;

    let bl = true;

    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      const ck = c.dataIndex;
      let hasEditor = typeof c.editor === "function";

      if (hasEditor) {
        if (ck !== rowKey) {
          let v = row[ck];
          if (v || v === 0) {
            bl = false;
            break;
          }
        }
      }
    }

    return bl;
  };

  /** 过滤无效的选中行key
   * isReset 是否重置新增数据的选中状态,重置、取消编辑状态时，需要把所有新增的数据行的选中状态清除；否则只清除忽略的新增行
   */
  filterSelectedRowKeys = (isReset = false) => {
    let { selectedRowKeys, selectedRows, rowKey } = this.state;

    let arr = this.insertedData.slice();

    let filterDataMap = {};
    if (isReset === true) {
      for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        filterDataMap[r[rowKey]] = true;
      }
    } else {
      filterDataMap = this.filterEmptyData(arr).emptyDataMap;
    }

    let nextKeys = [];
    let nextRows = [];

    for (let i = 0; i < selectedRowKeys.length; i++) {
      const k = selectedRowKeys[i];
      if (filterDataMap[k] !== true) {
        nextKeys.push(k);
      }
    }

    for (let i = 0; i < selectedRows.length; i++) {
      const r = selectedRows[i];
      const k = r[rowKey];
      if (filterDataMap[k] !== true) {
        nextRows.push(r);
      }
    }

    return {
      keys: nextKeys,
      rows: nextRows
    };
  };

  //过滤空数据行
  filterEmptyData = (arr = []) => {
    let data = [];
    let dataMap = {};

    let notEmptyData = [];
    let notEmptyDataMap = {};
    let emptyData = [];
    let emptyDataMap = {};

    let { rowKey } = this.state;
    let ignoreEmptyRow = this.props.ignoreEmptyRow;

    for (let i = 0; i < arr.length; i++) {
      const row = arr[i];
      data.push(row);
      dataMap[row[rowKey]] = true;
      if (ignoreEmptyRow && this.isEmptyRow(row)) {
        emptyData.push(row);
        emptyDataMap[row[rowKey]] = true;
      } else {
        notEmptyData.push(row);
        notEmptyDataMap[row[rowKey]] = row;
      }
    }

    return {
      data,
      dataMap,
      notEmptyData,
      notEmptyDataMap,
      emptyData,
      emptyDataMap
    };
  };

  //验证当前编辑状态中的数据行
  validateAll = async () => {
    let bl = true;
    let { editKeys, isEditAll, flatData } = this.state;
    let { rowKey, validateNoEditting } = this.props;

    let allData = flatData;

    let arr = [];

    if (validateNoEditting === true || isEditAll === true) {
      arr = allData;
    } else if (editKeys.length > 0) {
      arr = allData.filter(d => {
        return editKeys.indexOf(d[rowKey]) > -1;
      });
    }

    bl = await this.validateAsync(arr);
    this.call_onValidate(bl);

    return bl;
  };

  //验证当前所有数据，包括非编辑状态的数据
  validateData = async () => {
    let bl = true;
    let { flatData } = this.state;

    let arr = flatData;

    bl = await this.validateAsync(arr);
    this.call_onValidate(bl);

    let a = this.rowsAttribute;

    return bl;
  };

  editorInstance = [];
  setEditorIns = (row, column, ins) => {
    if (ins === null) {
      return;
    }

    let rowKey = row[this.props.rowKey];
    let columnKey = column.key;

    let editorInstance = [].concat(this.editorInstance);

    let ed = this.editorInstance.find(
      d => d.rowKey === rowKey && d.columnKey === columnKey
    );

    if (ed) {
      ed.editorInstance = ins;
    } else {
      editorInstance.push({
        columnKey: columnKey,
        rowKey: rowKey,
        editorInstance: ins
      });
    }

    this.editorInstance = editorInstance;
  };

  getEditorIns = (rowKey, columnKey) => {
    let ed = this.editorInstance.find(
      d => d.rowKey === rowKey && d.columnKey === columnKey
    );

    if (ed) {
      return ed.editorInstance;
    }
    return null;
  };

  renderEditor = (value, row, index, column) => {
    let fn = column.editor;
    let rowKey = row[this.state.rowKey];
    let columnDataIndex = column.dataIndex;
    let columnKey = column.key;
    let { valid, msg } = this.getValidate(row, columnDataIndex) || {};

    let rendered = fn(
      value,
      row,
      index,
      values => {
        this.editChange(values, row, index);
      },
      ins => {},
      {
        columnDataIndex: columnDataIndex,
        columnKey: columnKey,
        validate: this.validate
      }
    );

    let ed = rendered;

    let newRenderProps = {};

    if (rendered instanceof Object && !React.isValidElement(rendered)) {
      ed = rendered.children;
      newRenderProps.props = rendered.props;
    }

    if (!ed) {
      newRenderProps.children = null;
    } else {
      let c = (
        <Editor
          valid={valid}
          message={msg}
          onClick={this.onClick}
          rowKey={rowKey}
          columnKey={columnDataIndex}
          onKeyUp={this.onKeyUp}
          ref={ins => {
            this.setEditorIns(row, column, ins);
          }}
        >
          {ed}
        </Editor>
      );
      newRenderProps.children = c;
    }

    return newRenderProps;
  };

  renderValidator = (value, row, index, columnKey, fn) => {
    let { valid, msg } = this.getValidate(row, columnKey) || {};

    let rendered = value;

    if (typeof fn === "function") {
      rendered = fn(value, row, index);
    }

    return (
      <Validator
        valid={valid}
        message={msg}
        className="tablex-row-cell-validator"
      >
        {rendered}
      </Validator>
    );
  };

  formatColumns = () => {
    let { columns, editKeys, isEditAll, isEditing, columnOptions } = this.state;

    let rowKey = this.props.rowKey;
    let columnArr = cloneDeep(columns);

    let arr = columnArr;

    if (isEditing === true) {
      arr = treeFilter(columnArr, d => {
        if (d.editingVisible === true) {
          d.hidden = false;
        }
        return d.editingVisible !== false;
      });
    }

    let cols = treeToFlatten(arr).leafs;

    cols.forEach(d => {
      let hasEditor = typeof d.editor === "function";

      //控制编辑器权限
      let options = columnOptions[d.key] || {};
      if (options.disabled === true) {
        hasEditor = false;
      }
      //

      let renderFn = d.render;

      d.render = (value, row, index, extra) => {
        let columnIsEditing = false;
        if (isEditAll) {
          columnIsEditing = true;
        } else {
          columnIsEditing = editKeys.findIndex(k => k === row[rowKey]) > -1;
        }

        if (columnIsEditing && hasEditor) {
          return this.renderEditor(value, row, index, d);
        } else {
          let rowAttr = this.getValidate(row, d.key);
          if (typeof rowAttr.valid === "boolean") {
            return this.renderValidator(value, row, index, d.key, renderFn);
          } else {
            if (typeof renderFn === "function") {
              return renderFn(value, row, index, extra);
            }
            return value;
          }
        }
      };
    });

    arr = orderBy(arr, ["order"], ["asc"]);

    return cloneDeep(arr);
  };

  editAll = () => {
    this.setState({ isEditAll: true, isEditing: true, editKeys: [] });
  };

  endEdit = callBack => {
    let arr = [].concat(this.changedRows);

    let { keys, rows } = this.filterSelectedRowKeys();

    this.changedRows = [];
    this.rowsAttribute = [];
    this.editType = "";
    this.deletedData = [];
    this.insertedData = [];
    this.nextData = [];

    let nextState = {
      editSaveLoading: false,
      isEditAll: false,
      isAdding: false,
      isAddingRange: false,
      isEditing: false,
      editKeys: [],
      sourceData: cloneData(this.state.data)
    };

    nextState.selectedRowKeys = keys;
    nextState.selectedRows = rows;

    if (typeof callBack === "function") {
      this.setState(nextState, () => {
        callBack(arr, this.state.data, this.editType);
      });
    } else {
      this.setState(nextState);
    }
  };

  commitEdit = callback => {
    this.changedRows = [];
    this.rowsAttribute = [];
    this.editType = "";
    this.deletedData = [];
    this.insertedData = [];
    this.nextData = [];

    let nextState = {
      sourceData: cloneData(this.state.data)
    };

    if (typeof callback === "function") {
      this.setState(nextState, () => {
        callBack(this.state.data);
      });
    } else {
      this.setState(nextState);
    }
  };

  reset = () => {
    let nextState = {
      editSaveLoading: false,
      isEditAll: false,
      isAdding: false,
      isAddingRange: false,
      isEditing: false,
      editKeys: []
    };

    let { sourceData } = this.state;

    let { keys, rows } = this.filterSelectedRowKeys(true);
    nextState.selectedRowKeys = keys;
    nextState.selectedRows = rows;

    let data = cloneData(sourceData);
    nextState.data = data;
    nextState.flatData = treeToFlatten(data).list;

    this.editType = "";
    this.changedRows = [];
    this.insertedData = [];
    this.deletedData = [];
    this.nextData = [];
    this.rowsAttribute = [];
    this.setState(nextState);
  };

  //取消编辑
  cancelEdit = () => {
    if (typeof this.props.onCancel === "function") {
      this.props.onCancel(this.state.sourceData);
    }
    this.reset();
  };

  editRows = (keys, callback) => {
    this.editType = "edit";

    if (typeof this.props.onEditRowChange === "function") {
      this.props.onEditRowChange();
    }
    this.setState({ isEditAll: false, editKeys: keys, isEditing: true }, () => {
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  getChangedRows = () => {
    let arr = this.changedRows.slice();

    //排除掉删除的数据
    let deletedData = this.deletedData;
    let { rowKey } = this.state;

    //删除的数据行key
    let deletedDataKeyMap = {};
    for (let i = 0; i < deletedData.length; i++) {
      let k = deletedData[i][rowKey];
      deletedDataKeyMap[k] = true;
    }

    //新增的但值为空的数据
    let { emptyDataMap } = this.filterEmptyData(this.insertedData);
    //排除掉删除的数据、新增数据中的空数据
    let data = arr.filter(d => {
      let bl = true;
      let k = d[rowKey];
      if (deletedDataKeyMap[k] === true || emptyDataMap[k] === true) {
        bl = false;
      }
      return bl;
    });

    return data;
  };

  getInsertedData = () => {
    let arr = this.insertedData.slice();

    //排除掉删除的数据
    let deletedData = this.deletedData;
    let { rowKey } = this.state;

    //删除的数据行key
    let deletedDataKeyMap = {};
    for (let i = 0; i < deletedData.length; i++) {
      let k = deletedData[i][rowKey];
      deletedDataKeyMap[k] = true;
    }

    //排除掉删除的数据
    let data = arr.filter(d => {
      let bl = true;
      let k = d[rowKey];
      if (deletedDataKeyMap[k] === true) {
        bl = false;
      }
      return bl;
    });

    return data;
  };

  getRows = () => {
    return this.state.data;
  };

  addRow = (r = {}, editting = true) => {
    this.addRows([r], editting);
  };

  addRows = (arr = [], editting = true) => {
    let rowKey = this.props.rowKey;
    let { editKeys, flatData, isAppend, data } = this.state;

    if (isAppend === false) {
      editting = true;
    }

    let rowKeys = [];
    let newEditKeys = [];
    let newAddedData = [];

    this.editType = "add";

    let rows = [];
    let rowsMap = {};

    let rowTemplate = {};

    arr.forEach((d, i) => {
      let k = d[rowKey];

      if (!k) {
        k = d[rowKey] = "__id_" + i + "_" + new Date().getTime();
      }
      let row = Object.assign({}, rowTemplate, d);

      rows.push(row);
      rowsMap[k] = row;
      rowKeys.push(k);
    });

    newEditKeys = editKeys.concat(rowKeys);
    newAddedData = [].concat(rows);
    this.insertedData = newAddedData;

    let newData = distinctData(data.slice().concat(newAddedData), rowKey);

    this.nextData = newData;

    let nextState = {
      isAddingRange: true,
      data: newData,
      flatData: flatData.slice().concat(newAddedData)
    };

    if (editting === true) {
      nextState.isEditing = true;
      nextState.editKeys = newEditKeys;
    }

    this.setState(nextState, () => {
      if (editting === true) {
        this.scrollToRow(rowKeys[0], "start");
      }
    });
  };

  setRows = (arr = []) => {
    this.changedRows = [];
    this.setState({
      data: arr,
      editKeys: [],
      isEditAll: false,
      changedRows: []
    });
  };

  focusInput = editor => {
    if (!editor) {
      return;
    }

    let el = ReactDom.findDOMNode(editor);

    if (el) {
      //如果自定义李编辑焦点控件，则优先其focus
      let editorEL = el.getElementsByClassName("table-editor-focusable")[0];
      if (editorEL) {
        editorEL.focus();
        return;
      }
      //
      let selectEl = el.getElementsByClassName("ant-select-enabled")[0];

      if (selectEl) {
        selectEl.click();
        return;
      }

      let inputEl = el.getElementsByTagName("input")[0];

      if (inputEl) {
        inputEl.focus();
        return;
      }

      let buttonEL = el.getElementsByTagName("button")[0];

      if (buttonEL) {
        buttonEL.focus();
        return;
      }
    }
  };

  getNextEditor = (keyCode, rowKey, columnKey) => {
    let nextEditor = null;

    let key = this.props.rowKey;

    let { columns } = this.state;
    let dataList = this.getDataList();

    let rows = [].concat(dataList);

    let arr = treeToFlatten(columns).leafs;

    if (keyCode === 38) {
      //top

      let currIndex = rows.findIndex(d => d[key] === rowKey);
      let nextRow = rows[currIndex - 1];

      if (nextRow) {
        nextEditor = this.getEditorIns(nextRow[key], columnKey);
      }
    }

    if (keyCode === 40) {
      //bottom

      let currIndex = rows.findIndex(d => d[key] === rowKey);
      let nextRow = rows[currIndex + 1];

      if (nextRow) {
        nextEditor = this.getEditorIns(nextRow[key], columnKey);
      }
    }

    if (keyCode === 37) {
      //left

      let currColumnIndex = arr.findIndex(d => d["dataIndex"] === columnKey);
      let nextColumn = arr[currColumnIndex - 1];

      if (nextColumn) {
        nextEditor = this.getEditorIns(rowKey, nextColumn["dataIndex"]);
      }
    }

    if (keyCode === 39 || keyCode === 13) {
      //right

      let currColumnIndex = arr.findIndex(d => d["dataIndex"] === columnKey);
      let nextColumn = arr[currColumnIndex + 1];

      if (nextColumn) {
        nextEditor = this.getEditorIns(rowKey, nextColumn["dataIndex"]);
      }
    }

    return nextEditor;
  };

  getNextRow = (keyCode, rowKey) => {
    let key = this.props.rowKey;

    let dataList = this.getDataList();

    let rows = [].concat(dataList);
    let nextRow = null;

    if (keyCode === 38) {
      //top
      let currIndex = rows.findIndex(d => d[key] === rowKey);
      nextRow = rows[currIndex - 1];
    }

    if (keyCode === 40) {
      //bottom
      let currIndex = rows.findIndex(d => d[key] === rowKey);
      nextRow = rows[currIndex + 1];
    }

    return nextRow;
  };

  focusNextEditor = (keyCode, rowKey, columnKey) => {
    let nextRow = this.getNextRow(keyCode, rowKey, columnKey);
    if (nextRow) {
      let nextRowKey = nextRow[this.state.rowKey];
      this.editRows([nextRowKey], () => {
        let nextEditor = this.getNextEditor(keyCode, rowKey, columnKey);
        this.focusInput(nextEditor);
      });
    } else {
      let nextEditor = this.getNextEditor(keyCode, rowKey, columnKey);
      this.focusInput(nextEditor);
    }
  };
  onKeyUp = (e, rowKey, columnKey) => {
    if (this.props.keyboardNavigation !== true) {
      return;
    }

    if (this.props.singleRowEdit === true) {
      this.focusNextEditor(e.keyCode, rowKey, columnKey);
      return;
    }

    let nextEditor = this.getNextEditor(e.keyCode, rowKey, columnKey);

    let currEditor = this.getEditorIns(rowKey, columnKey);

    if (currEditor) {
      //ly 2018年11月6日 11点12分
      //当当前编辑器为下拉类型时，如 datePicker comobobox 。获取展开状态，展开时禁用表格列的快捷键切换
      if (typeof currEditor.getRealOpenState === "function") {
        let bl = currEditor.getRealOpenState();

        if (e.keyCode === 13) {
          this.focusInput(nextEditor);
          return false;
        }

        if (bl === true) {
          return false;
        }
      }
    }

    this.focusInput(nextEditor);
  };

  onClick = e => {
    this.isMouseFocus = true;
    if (this.props.editorClickBubble === false) {
      e.stopPropagation();
    }
  };

  getModifiedData = () => {
    //修改的数据,平级数据
    let changedRows = this.changedRows;
    //添加的数据,平级数据
    let insertedData = this.insertedData;
    //删除的数据,平级数据
    let deletedData = this.deletedData;

    let { rowKey } = this.state;

    //当前表格数据,树形数据
    let data = this.nextData;
    if (
      changedRows.length === 0 &&
      insertedData.length === 0 &&
      deletedData.length === 0
    ) {
      data = this.state.data;
    }

    //最终表格产生更改的数据
    let changedState = {
      data: data.slice(),
      inserted: [],
      changed: [],
      deleted: []
    };

    //改变的数据行key
    let changedRowsKeyMap = {};
    for (let i = 0; i < changedRows.length; i++) {
      let k = changedRows[i][rowKey];
      changedRowsKeyMap[k] = true;
    }

    //删除的数据行key
    let deletedDataKeyMap = {};
    for (let i = 0; i < deletedData.length; i++) {
      let k = deletedData[i][rowKey];
      deletedDataKeyMap[k] = true;
    }

    //过滤新增数据行中的空数据行
    let {
      dataMap: addedDataKeyMap,
      emptyDataMap: addedEmptyDataMap
    } = this.filterEmptyData(insertedData);

    //修改的数据，排除掉新增、删除的数据
    changedState.changed = changedRows.filter(d => {
      let bl = true;
      let k = d[rowKey];
      if (addedDataKeyMap[k] === true || deletedDataKeyMap[k] === true) {
        bl = false;
      }
      return bl;
    });

    //新增的数据，排除掉删除的数据
    changedState.inserted = insertedData.filter(d => {
      let bl = true;
      let k = d[rowKey];
      if (deletedDataKeyMap[k] === true) {
        bl = false;
      }

      //排除掉未修改的数据
      //addAsChanged不为true时，需要将未修改的数据进行排除
      if (this.props.addAsChanged !== true) {
        if (changedRowsKeyMap[k] !== true) {
          bl = false;
        }
      }

      //排除掉空数据行
      if (addedEmptyDataMap[k] === true) {
        bl = false;
      }

      return bl;
    });

    //删除的数据，排除掉新增的数据
    changedState.deleted = deletedData.filter(d => {
      let bl = true;
      let k = d[rowKey];
      if (addedDataKeyMap[k] === true) {
        bl = false;
      }
      return bl;
    });

    //排除 新增的但未更改的数据
    let newTreeData = treeFilter(
      data.slice(),
      d => !(addedEmptyDataMap[d[rowKey]] === true)
    );
    changedState.data = newTreeData.slice();
    //

    return changedState;
  };

  completeEdit = async callBack => {
    let { showValidateMessage } = this.props;

    //最终表格产生更改的数据
    let changedState = this.getModifiedData();

    let bl = true;

    let hasModifyedData = false;

    if (
      changedState.changed.length > 0 ||
      changedState.inserted.length > 0 ||
      changedState.deleted.length > 0
    ) {
      hasModifyedData = true;
    }

    if (hasModifyedData === false) {
      this.cancelEdit();
      return false;
    }

    bl = await this.validate();

    if (bl === false) {
      showValidateMessage && message.error(this.props.intl["validateError"]);
      return false;
    }

    let fn = this.props.onComplete;

    if (typeof fn === "function") {
      fn(changedState);
    }

    this.endEdit(callBack);
    return bl;
  };

  editSave = async callBack => {
    let editType = this.editType;

    //是否由外部控制编辑状态
    if (this.state.isControledEdit === true) {
      if (!editType) {
        editType = "edit";
      }
    }
    //

    //确定按钮保存前置事件
    if (typeof this.props.onBeforeSave === "function") {
      let res = this.props.onBeforeSave();
      if (res === false) {
        return;
      }
    }

    if (typeof this.props.onBeforeSaveAsync === "function") {
      this.setState({ editSaveLoading: true });
      let res = await this.props.onBeforeSaveAsync();
      if (res === false) {
        this.setState({ editSaveLoading: false });
        return;
      }
      this.setState({ editSaveLoading: false });
    }
    //

    if (!editType) {
      console.error(this.props.intl["noEditTypeError"]);
      return;
    }

    let { inserted, deleted, changed, data: newRows } = this.getModifiedData();

    let changedRows = changed;
    if (editType === "add") {
      changedRows = changed.concat(inserted);
    } else if (editType === "delete") {
      changedRows = deleted;
    }

    let bl = true;

    if (editType && editType !== "delete") {
      if (this.props.alwaysValidate === true) {
        bl = await this.validateAll();
      } else {
        bl = await this.validate();
      }

      if (bl === false) {
        if (this.props.showValidateMessage) {
          message.error(this.props.intl["validateError"]);
        }
        return;
      }
    }

    //当alwaysSave为true时，点击保存按钮，不论是否存在改变行始终都进行保存操作
    if (this.props.alwaysSave === true) {
    } else {
      if (changedRows.length <= 0) {
        this.cancelEdit();
        return;
      }
    }

    let onEditSave = this.props.onEditSave;

    if (typeof onEditSave === "function") {
      this.setState({ editSaveLoading: true });

      let fn = onEditSave(changedRows, newRows, this.editType);

      if (fn) {
        //如果返回的是一个promise对象，则只有当调用resolve时，才触发编辑完成事件
        if (fn.constructor && fn.constructor.name === "Promise") {
          fn.then(
            () => {
              this.endEdit(callBack);
            },
            e => {
              if (e) {
                console.error(e);
              }
              this.setState({ editSaveLoading: false });
            }
          );
        } else {
          this.setState({ editSaveLoading: false }, () => {
            this.endEdit(callBack);
          });
        }
      } else {
        this.endEdit(callBack);
      }
    } else {
      this.setState({ data: newRows }, () => {
        this.endEdit(callBack);
      });
    }
  };

  /**
   * "edit"：编辑 ； "add"：新增 "delete"： 删除
   */
  editType = "";

  //quiet : 是否静默执行，为true时不执行事件
  edit = (quiet = false) => {
    let arr = this.state.data || [];

    let bl = true;

    if (!quiet && typeof this.props.onBeforeEdit === "function") {
      bl = this.props.onBeforeEdit(arr);
    }

    if (arr.length === 0) {
      message.error(this.props.intl["noEditableData"]);
      return false;
    }

    if (bl === false) {
      return false;
    }

    this.editType = "edit";

    this.editAll();

    if (!quiet && typeof this.props.onEdit === "function") {
      this.props.onEdit();
    }
  };

  deleteRowsState = (rowKeys = []) => {
    let { selectedRowKeys, editKeys } = this.state;

    //删除的行key
    let keysMap = {};

    for (let i = 0; i < rowKeys.length; i++) {
      keysMap[rowKeys[i]] = true;
    }

    //删除选中状态
    let nextSelectedRowKeys = [];

    for (let i = 0; i < selectedRowKeys.length; i++) {
      let k = selectedRowKeys[i];
      if (keysMap[k] !== true) {
        nextSelectedRowKeys.push(k);
      }
    }

    //删除编辑状态
    let nextEditKeys = [];

    for (let i = 0; i < editKeys.length; i++) {
      let k = editKeys[i];
      if (keysMap[k] !== true) {
        nextEditKeys.push(k);
      }
    }

    return {
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys
    };
  };

  delete = () => {
    let {
      data,
      rowKey,
      selectedRowKeys = [],
      selectedRows = [],
      isEditing
    } = this.state;

    let bl = true;

    if (typeof this.props.onBeforeDelete === "function") {
      bl = this.props.onBeforeDelete(selectedRowKeys, selectedRows);
    }

    if (bl === false) {
      return false;
    }

    if (selectedRowKeys.length <= 0) {
      message.warn(this.props.intl["needSelectToDelete"]);
    } else {
      this.editType = "delete";

      let { newData, newFlatData, deletedRows, deletedRowKeys } = deleteData(
        data,
        selectedRowKeys,
        rowKey
      );
      this.deletedData = deletedRows;
      this.nextData = newData;

      let { editKeys: nextEditKeys } = this.deleteRowsState(deletedRowKeys);

      //删除新增但未提交的行数据
      let { newData: newInsertedData } = deleteData(
        this.insertedData,
        deletedRowKeys,
        rowKey
      );
      this.insertedData = newInsertedData;
      //

      let nextState = {
        deleteLoading: false,
        selectedRowKeys: [],
        selectedRows: [],
        editKeys: nextEditKeys,
        data: newData,
        flatData: newFlatData
      };

      let onEditSave = this.props.onEditSave;

      //don`t call onEditSave when table is Editing ,oterwise can`t rollback deleted data
      if (isEditing !== true && typeof onEditSave === "function") {
        this.setState({ deleteLoading: true });

        let fn = onEditSave(deletedRows, newData, this.editType);

        if (fn) {
          if (fn.constructor && fn.constructor.name === "Promise") {
            fn.then(
              () => {
                this.setState(nextState);
              },
              e => {
                if (e) {
                  console.error(e);
                }
                this.setState({ deleteLoading: false });
              }
            );
          } else {
            this.setState(nextState);
          }
        } else {
          this.setState(nextState);
        }
      } else {
        this.setState(nextState);
      }

      if (typeof this.props.onDelete === "function") {
        this.props.onDelete(deletedRowKeys, deletedRows);
      }
    }
  };

  //silent : 是否静默执行，为true时不执行事件
  addRange = (rowCount, quiet = false) => {
    let { rowTemplate, rowKey, defaultAddCount } = this.props;

    let bl = true;

    if (!quiet && typeof this.props.onBeforeAdd === "function") {
      bl = this.props.onBeforeAdd();
    }

    if (bl === false) {
      return false;
    }

    this.editType = "add";

    let addCount = rowCount || defaultAddCount;

    let { data, flatData, editKeys } = this.state;

    let insertedData = this.insertedData.slice();
    let keys = editKeys.slice();

    for (let i = 0; i < addCount; i++) {
      let row = {};

      if (typeof rowTemplate === "function") {
        row = rowTemplate(i);
        if (!row[rowKey]) {
          row[rowKey] = "__id_" + i + "_" + new Date().getTime();
        }
      } else {
        row[rowKey] = "__id_" + i + "_" + new Date().getTime();
      }

      keys.push(row[rowKey]);
      insertedData.push(row);
    }

    if (this.props.singleRowEdit === true) {
      keys = [keys[0]];
    }

    let newData = distinctData(data.slice().concat(insertedData), rowKey);

    this.changedRows = [];
    this.insertedData = insertedData;
    this.nextData = newData;

    this.setState(
      {
        data: newData,
        flatData: flatData.slice().concat(insertedData),
        editKeys: keys,
        isEditing: true,
        isAdding: false,
        isAddingRange: true,
        changedRows: []
      },
      () => {
        this.scrollToRow(keys[0], "start");

        if (!quiet && typeof this.props.onAdd === "function") {
          this.props.onAdd(insertedData, newData, "add");
        }
      }
    );
  };

  editToolsWrapper = (el, o) => {
    let config = this.props.editToolsConfig || {};

    let wrapper = config.wrapper;
    if (typeof wrapper === "function") {
      return wrapper(el, o, this.api);
    } else {
      return el;
    }
  };
  editTools = () => {
    let tools = this.props.editTools || [];
    let config = this.props.editToolsConfig || {};

    if (tools.length <= 0) {
      return null;
    }

    /** 按钮额外属性 */
    let buttonProps = config.props || {};
    /** 按钮hoc */
    let wrapper = this.editToolsWrapper;

    let buttons = [];

    let { isEditing } = this.state;

    let itemStyle = config.itemStyle || {};

    let okText = config.okText || this.props.intl["editOkButton"];
    let okIcon = config.okIcon || "";
    okIcon = okIcon ? <Icon type={okIcon} /> : null;
    let cancelText = config.cancelText || this.props.intl["editCancelButton"];
    let cancelIcon = config.cancelIcon || "";
    cancelIcon = cancelIcon ? <Icon type={cancelIcon} /> : null;

    let addText = config.addText || this.props.intl["addButton"];
    let addIcon = config.addIcon || "";
    addIcon = addIcon ? <Icon type={addIcon} /> : null;

    let editText = config.editText || this.props.intl["editButton"];
    let editIcon = config.editIcon || "";
    editIcon = editIcon ? <Icon type={editIcon} /> : null;

    let deleteText = config.deleteText || this.props.intl["deleteButton"];
    let deleteIcon = config.deleteIcon || "";
    deleteIcon = deleteIcon ? <Icon type={deleteIcon} /> : null;

    if (this.props.singleRowEdit !== true && isEditing) {
      buttons.push(
        <Button
          key={"_btnOk"}
          loading={this.state.editSaveLoading}
          style={{ ...itemStyle }}
          {...buttonProps["ok"]}
          onClick={this.editSave}
          className="table-tools-item"
        >
          {okIcon}
          {okText}
        </Button>
      );
      buttons.push(
        <Button
          key={"_btnCancel"}
          style={itemStyle}
          {...buttonProps["cancel"]}
          onClick={this.cancelEdit}
          className="table-tools-item"
        >
          {cancelIcon}
          {cancelText}
        </Button>
      );
    }

    let rangeUnitText = this.props.intl["addRangeRowText"];

    let edittingToolsShowType = 0;

    if (isEditing) {
      edittingToolsShowType = this.props.edittingToolsShowType || 0;
    } else {
      edittingToolsShowType = 3;
    }

    let showTypes = {
      "0": [], //不显示任何按钮
      "1": [1], //只显示内置的编辑按钮
      "2": [2], //只显示自定义按钮
      "3": [1, 2] //显示所有按钮
    }[edittingToolsShowType];

    tools.forEach((d, i) => {
      let styles = { ...itemStyle };

      const menu = (
        <Menu onClick={e => this.addRange(e.item.props.value)}>
          <Menu.Item key="1" value={5}>
            5 {rangeUnitText}
          </Menu.Item>
          <Menu.Item key="2" value={10}>
            10 {rangeUnitText}
          </Menu.Item>
        </Menu>
      );

      if (showTypes.indexOf(1) > -1) {
        if (d === "addSingle") {
          buttons.push(
            wrapper(
              <Button
                key={d + "_1"}
                style={styles}
                {...buttonProps[d]}
                className="table-tools-item table-tools-addSingle"
                onClick={() => this.addRange(1)}
              >
                {addIcon}
                {addText}
              </Button>,
              d,
              addText
            )
          );
        }

        if (d === "add") {
          buttons.push(
            wrapper(
              <Dropdown key={d + "_1"} overlay={menu} {...buttonProps[d]}>
                <Button
                  style={styles}
                  onClick={() => this.addRange()}
                  className="table-tools-item table-tools-add"
                >
                  {addIcon} {addText}
                  <Icon type="down" />
                </Button>
              </Dropdown>,
              d,
              addText
            )
          );
        }

        if (this.props.singleRowEdit !== true && !isEditing && d === "edit") {
          buttons.push(
            wrapper(
              <Button
                key={d + "_1"}
                style={styles}
                {...buttonProps[d]}
                className="table-tools-item table-tools-edit"
                onClick={() => this.edit()}
              >
                {editIcon}
                {editText}
              </Button>,
              d,
              editText
            )
          );
        }

        if (d === "delete") {
          let { selectedRowKeys = [], data = [] } = this.state;
          let hasSelectedRows = selectedRowKeys.length > 0;
          let hasData = data.length > 0;

          buttons.push(
            wrapper(
              <Popconfirm
                key={d}
                title={this.props.intl["deleteConfirmTitle"]}
                okText={this.props.intl["deleteConfirmOk"]}
                cancelText={this.props.intl["deleteConfirmCancel"]}
                onConfirm={this.delete}
                disabled={!hasSelectedRows}
              >
                <Button
                  style={styles}
                  loading={this.state.deleteLoading}
                  {...buttonProps[d]}
                  onClick={e => {
                    e.stopPropagation();
                    if (!hasSelectedRows) {
                      if (hasData) {
                        message.warn(this.props.intl["noSelectToDelete"]);
                      } else {
                        message.warn(this.props.intl["noDeletableData"]);
                      }
                    }
                  }}
                  className="table-tools-item table-tools-delete"
                >
                  {deleteIcon}
                  {deleteText}
                </Button>
              </Popconfirm>,
              d,
              deleteText
            )
          );
        }
      }
      if (showTypes.indexOf(2) > -1) {
        if (typeof d === "function") {
          buttons.push(
            wrapper(
              <span
                style={styles}
                className="table-tools-item"
                key={"_fnTools_" + i}
              >
                {d(this.api)}
              </span>,
              d
            )
          );
        }

        if (typeof d === "object" && d !== null) {
          let toolIcon = d.icon;
          toolIcon = toolIcon ? <Icon type={toolIcon} /> : null;
          let toolAttr = d.props || {};
          buttons.push(
            wrapper(
              <Button
                key={"_objTools_" + i}
                onClick={d.handler}
                style={styles}
                {...toolAttr}
                className="table-tools-item"
              >
                {toolIcon}
                {d.text}
              </Button>,
              d,
              d.text
            )
          );
        }
      }
    });

    if (buttons.length === 0) {
      return null;
    }

    return <Fragment>{buttons}</Fragment>;
  };

  getProps = () => {
    let props = this.props || {};
    let newProps = Object.assign({}, props);

    return newProps;
  };

  headerToolsBar = () => {
    let header = null;

    let { editToolsConfig = {} } = this.props;
    let toolBarPosition = editToolsConfig.position || "bottom";

    if (toolBarPosition === "top") {
      header = this.createToolBar("top");
    }

    return header;
  };

  footerToolsBar = () => {
    let { editToolsConfig = {} } = this.props;
    let toolBarPosition = editToolsConfig.position || "bottom";

    let toolBar = null;

    if (toolBarPosition === "bottom") {
      toolBar = this.createToolBar();
    }

    return toolBar;
  };

  onSelectChange = (selectedKeys, selectedRows, triggerKey, extra) => {
    this.setState(
      {
        selectedRowKeys: selectedKeys.slice(),
        selectedRows: selectedRows.slice()
      },
      () => {
        if (typeof this.props.onSelectChange === "function") {
          this.props.onSelectChange(
            selectedKeys,
            selectedRows,
            triggerKey,
            extra
          );
        }
      }
    );
  };

  onExpandedRowsChange = keys => {
    this.setState({
      expandedRowKeys: keys.slice()
    });
    if (typeof this.props.onExpandedRowsChange === "function") {
      this.props.onExpandedRowsChange(keys);
    }
  };

  rowClassName = (row, index) => {
    let { focusedRowKeys, rowKey } = this.state;
    let arr = [];

    if (typeof this.props.rowClassName === "function") {
      let cls = this.props.rowClassName(row, index);
      cls && arr.push(cls);
    }

    if (focusedRowKeys.indexOf(row[rowKey]) > -1) {
      arr.push("tablex-row-focused");
    }

    return arr.join(" ");
  };

  onRow = (rowData, rowIndex, extra) => {
    let fn = this.props.onRow;
    let rowKey = this.state.rowKey;

    let o = {};
    if (typeof fn === "function") {
      o = fn(rowData, rowIndex, extra) || {};
    }

    return {
      ...o,
      onClick: e => {
        this.editRows([rowData[rowKey]]);
        if (typeof o.onClick === "function") {
          o.onClick(e);
        }
      }
    };
  };

  createToolBar = pos => {
    let { editable, readOnly, toolBarStyle, extraTools } = this.props;
    let styles = {};
    if (pos === "top") {
      styles.margin = "0 0 5px 0";
    }

    let extras = null;

    if (typeof extraTools === "function") {
      extras = extraTools(this);
    }

    styles = Object.assign(styles, toolBarStyle);

    if (editable === true && readOnly !== true) {
      let tools = this.editTools();

      if (tools !== null) {
        return (
          <div
            style={{
              ...styles
            }}
          >
            {tools}
            {extras}
          </div>
        );
      } else {
        if (extras === null) {
          return null;
        } else {
          return (
            <div
              style={{
                ...styles
              }}
            >
              {extras}
            </div>
          );
        }
      }
    } else {
      if (extras === null) {
        return null;
      } else {
        return (
          <div
            style={{
              ...styles
            }}
          >
            {extras}
          </div>
        );
      }
    }
  };

  getDataRows = () => {
    let { data, isAdding, isAddingRange, isAppend } = this.state;
    let insertedData = this.insertedData;
    let arr = data;

    let insertedRows = insertedData;

    if (isAdding === true || isAddingRange === true) {
      if (isAppend === true) {
        arr = data;
      } else {
        arr = insertedRows;
      }
    }

    return arr;
  };

  updateRows = callback => {
    let arr = [];

    if (typeof callback === "function") {
      let currData = this.getDataRows();

      arr = callback(currData);

      if (arr.length > 0) {
        this.setState({
          data: this.state.data
        });
      }
    }
  };

  nextData = [];
  insertedData = [];
  insertData = (
    {
      data = [],
      parentKey = "",
      editing = false,
      prepend = false,
      scrollTo = true,
      startIndex = -1
    },
    callback
  ) => {
    let { data: source, rowKey, editKeys, expandedRowKeys } = this.state;

    let insertedData = this.insertedData;

    let { newData, newFlatData, insertedRows, insertedRowKeys } = insertData({
      source,
      data,
      prepend,
      parentKey,
      rowKey,
      startIndex
    });

    let nextExpandedRowKeys = expandedRowKeys.slice();

    if (parentKey && expandedRowKeys.indexOf(parentKey) === -1) {
      nextExpandedRowKeys.push(parentKey);
    }

    let nextState = {
      expandedRowKeys: nextExpandedRowKeys,
      data: newData,
      flatData: newFlatData
    };

    this.insertedData = insertedData.slice().concat(insertedRows);
    this.nextData = newData;

    if (editing === true) {
      nextState.editKeys = editKeys.concat(insertedRowKeys);
      nextState.isEditing = true;
      nextState.isAddingRange = true;
    }

    let res = {
      data: newData,
      inserted: insertedRows,
      insertedKeys: insertedRowKeys
    };

    this.setState(nextState, () => {
      if (scrollTo === true) {
        this.scrollToRow(insertedRowKeys[0], "start");
      }
      if (typeof callback === "function") {
        callback(res);
      }
    });

    return res;
  };

  deletedData = [];
  deleteData = (rowKeys, callback) => {
    let { data, rowKey, selectedRowKeys } = this.state;

    let keys = rowKeys;

    if (typeof rowKeys === "undefined") {
      keys = selectedRowKeys;
    }

    let { newData, newFlatData, deletedRows, deletedRowKeys } = deleteData(
      data,
      keys,
      rowKey
    );

    let deletedData = this.deletedData;
    this.deletedData = deletedData.slice().concat(deletedRows);
    this.nextData = newData;

    let {
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys
    } = this.deleteRowsState(deletedRowKeys);

    let res = {
      deleted: deletedRows,
      deletedKeys: deletedRowKeys,
      data: newData
    };

    this.setState(
      {
        selectedRowKeys: nextSelectedRowKeys,
        editKeys: nextEditKeys,
        data: newData,
        flatData: newFlatData
      },
      () => {
        if (typeof callback === "function") {
          callback(res);
        }
      }
    );

    return res;
  };

  modifyData = (rows = [], silent = false, callback) => {
    let { data } = this.state;

    let insertedData = this.insertedData;

    let rowKey = this.props.rowKey;

    let rowsMap = {};
    let addedRowsMap = {};

    let modifiedDataKeyMap = {};
    let modifiedData = [];

    treeFilter(data, d => {
      let k = d[rowKey];
      rowsMap[k] = d;
      return true;
    });

    for (let i = 0; i < insertedData.length; i++) {
      let row = insertedData[i];
      let k = row[rowKey];
      addedRowsMap[k] = row;
    }

    for (let i = 0; i < rows.length; i++) {
      const d = rows[i];
      let key = d[rowKey];

      let row = rowsMap[key];
      if (row) {
        Object.keys(d).forEach(k => {
          if (k !== rowKey) {
            row[k] = d[k];
          }
        });
        modifiedDataKeyMap[key] = row;
      }

      let addedRow = addedRowsMap[key];
      if (addedRow) {
        Object.keys(d).forEach(k => {
          if (k !== rowKey) {
            addedRow[k] = d[k];
          }
        });
        modifiedDataKeyMap[key] = addedRow;
      }
    }

    this.addToChanged(modifiedDataKeyMap);

    for (const k in modifiedDataKeyMap) {
      if (modifiedDataKeyMap.hasOwnProperty(k)) {
        modifiedData.push(modifiedDataKeyMap[k]);
      }
    }

    this.nextData = data.slice();

    if (silent === false) {
      this.forceUpdate(() => {
        if (typeof callback === "function") {
          callback(modifiedData);
        }
      });
    }

    return modifiedData;
  };

  filterData = (fn, silent = false, source) => {
    let { rowKey, rawData: treeData } = this.state;
    let dataSource = treeData;

    if (source instanceof Array) {
      dataSource = source;
    }

    let { list: flatData, treeProps } = treeToList(dataSource, rowKey);

    let matches = [];
    let matchesMap = {};

    let matchedParentKeys = {};
    let matchedParents = [];

    let flatDataMap = {};

    for (let i = 0; i < flatData.length; i++) {
      let d = flatData[i];

      let k = d[rowKey];
      if (fn(d) === true) {
        matches.push(d);
        matchesMap[k] = true;

        let nodeProps = treeProps[k];
        let paths = nodeProps.path || [];

        paths.forEach(p => {
          if (p !== k) {
            matchedParentKeys[p] = true;
          }
        });
      }

      flatDataMap[k] = d;
    }

    Object.keys(matchedParentKeys).forEach(k => {
      if (matchesMap[k] !== true) {
        matchedParents.push(flatDataMap[k]);
      }
    });

    let list = matches.concat(matchedParents);

    let newTreeData = getTreeFromFlatData({
      flatData: list,
      getKey: n => n[rowKey],
      getParentKey: n => {
        let k = n[rowKey];
        return treeProps[k].parentKey;
      },
      rootKey: ""
    });

    if (silent === false) {
      this.setState({ data: newTreeData, flatData: list });
    }

    return newTreeData;
  };

  findData = (fn, { startIndex = 0, startRowKey = "", focused = true }) => {
    let { flatData: data, rowKey } = this.state;

    let found = null;
    let start = 0;

    if (startRowKey) {
      let i = data.findIndex(d => d[rowKey] === startRowKey);
      if (i > -1) {
        start = i + 1;
      }
    } else {
      start = startIndex;
    }

    for (let i = start, len = data.length; i < len; i++) {
      let d = data[i];
      if (d) {
        let bl = fn(d);
        if (bl === true) {
          found = { row: d, index: i };
          break;
        }
      }
    }

    if (focused === true && found && found.index > -1) {
      this.setState({ focusedRowKeys: [found.row[rowKey]] }, () => {
        this.scrollToItem(found.index, "center");
      });
    }

    return found;
  };

  api = {
    /** 添加n行数据-同默认按钮动作 */
    addRange: this.addRange.bind(this),
    /** 添加数据行-同默认按钮动作 */
    addRows: this.addRows.bind(this),
    /** 删除选中数据-同默认按钮动作 */
    delete: this.delete.bind(this),
    /** 编辑所有数据-同默认按钮动作 */
    edit: this.edit.bind(this),
    /** 编辑保存-同默认按钮动作 */
    saveEdit: this.editSave.bind(this),

    /** 编辑指定行 */
    editRows: this.editRows.bind(this),
    /** 编辑所有 */
    editAll: this.editAll.bind(this),
    /** 删除数据 */
    deleteData: this.deleteData.bind(this),
    /** 插入数据 */
    insertData: this.insertData.bind(this),
    /** 修改数据 */
    modifyData: this.modifyData.bind(this),
    /** 提交编辑的数据(提交数据并保持编辑状态) */
    commitEdit: this.commitEdit.bind(this),
    /** 完成编辑 */
    completeEdit: this.completeEdit.bind(this),
    /** 取消编辑 */
    cancelEdit: this.cancelEdit.bind(this),
    /** 获取表格所有状态下的数据 */
    getDataState: this.getModifiedData.bind(this),

    /** 查找数据行 */
    findData: this.findData.bind(this),
    /** 筛选数据 */
    filterData: this.filterData.bind(this),

    /** 滚动到指定行 */
    scrollToItem: this.scrollToItem.bind(this),

    reset: this.reset.bind(this),
    isEditing: this.isEditing.bind(this),
    validateChanged: this.validate.bind(this),
    validateAll: this.validateAll.bind(this),
    validateData: this.validateData.bind(this),
    clearValidation: this.clearValidation.bind(this),

    getData: () => this.state.data,
    getAllData: () => {
      return {
        data: this.state.data, //当前表格的源数据
        changedData: this.getChangedRows(), //改变的行数据
        addedData: this.getInsertedData(), //添加的行数据
        currData: this.getDataRows() //当前表格状态显示的数据
      };
    }
  };

  componentDidMount() {
    let o = this.props.actions;
    if (o && typeof o === "object") {
      let actions = this.api;
      for (const k in actions) {
        o[k] = actions[k];
      }
    }
  }

  render() {
    let columns = this.formatColumns();

    let arr = this.getDataRows();

    let props = this.props;

    let newProps = {
      data: arr,
      columns,
      onSelectChange: this.onSelectChange,
      onExpandedRowsChange: this.onExpandedRowsChange,
      expandedRowKeys: this.state.expandedRowKeys,
      selectedRowKeys: this.state.selectedRowKeys,
      headerToolsBar: this.headerToolsBar,
      footerToolsBar: this.footerToolsBar,
      innerRef: this.innerTableRef,
      rowClassName: this.rowClassName,
      actions: this.api
    };

    if (props.singleRowEdit === true && props.editable && !props.readOnly) {
      newProps.onRow = this.onRow;
    }

    if (props.readOnly === true) {
      newProps.selectMode = "none";
    }

    let classNames = [];

    if (props.className) {
      classNames.push(props.className);
    }

    if (props.editorNoBorder === true) {
      classNames.push("tablex-editor-noborder");
    }

    newProps.className = classNames.join(" ");

    return <Table {...props} {...newProps} />;
  }
}

EditableTable.defaultProps = {
  editable: false,
  readOnly: false,
  editTools: ["edit", "add"],
  toolBarStyle: {},
  editToolsConfig: {
    position: "bottom",
    wrapper: null,
    props: {},
    itemStyle: {},
    editText: "",
    editIcon: "",
    addText: "",
    addIcon: "",
    deleteText: "",
    deleteIcon: "",
    okText: "",
    okIcon: "",
    cancelText: "",
    cancelIcon: ""
  },
  edittingToolsShowType: 1,
  defaultAddCount: 1,
  isAppend: false,
  ignoreEmptyRow: true,
  validateTrigger: "onSave",
  validateDelay: 300,
  alwaysValidate: false,
  alwaysSave: false,
  addAsChanged: false,
  validateNoEditting: false,
  dataControled: false,
  editorNoBorder: false,
  keyboardNavigation: true,
  editorClickBubble: false,
  showValidateMessage: true,
  singleRowEdit: false,
  intl: {
    editorInputError: "输入不正确",
    editorRequiredError: "请输入必填项",
    validateError: "信息录入不正确，请检查",
    noEditTypeError:
      "未检测到编辑状态,如果使用了api.xxx进行编辑，请使用completeEdit、onComplete替代...",
    noEditableData: "没有可编辑的数据",
    needSelectToDelete: "请选择要删除的数据",
    editOkButton: "确定",
    editCancelButton: "取消",
    addButton: "新增",
    editButton: "编辑",
    deleteButton: "删除",
    addRangeRowText: "行",
    deleteConfirmTitle: "确定删除选中的数据吗？",
    deleteConfirmOk: "确定",
    deleteConfirmCancel: "取消",
    noSelectToDelete: "请选择要删除的数据",
    noDeletableData: "没有可删除的数据",

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

EditableTable.propTypes = {
  intl: PropTypes.object,
  /** 是否只读模式，只读模式下，将无法编辑，且无法触发选择事件 */
  readOnly: PropTypes.bool,
  /** 是否允许编辑 */
  editable: PropTypes.bool,
  /** 是否启用键盘导航 */
  keyboardNavigation: PropTypes.bool,
  /** 编辑器是否允许点击事件冒泡 */
  editorClickBubble: PropTypes.bool,
  /** 工具栏样式 */
  toolBarStyle: PropTypes.object,
  /** 工具栏，工具按钮 ['edit', 'add','delete',{icon:"",text:"",props:{},handler:Function},Function] addSingle:单行新增 */
  editTools: PropTypes.array,
  /** 工具栏，工具按钮属性配置{wrapper:function,props:{}, position: "bottom", itemStyle: {}, editText: "", editIcon: "", addText: "", addIcon: "", deleteText: "", deleteIcon: "", okText: "", okIcon: "", cancelText: "", cancelIcon: "" } */
  editToolsConfig: PropTypes.object,
  /** 额外的工具栏按钮渲染 */
  extraTools: PropTypes.func,
  /** 工具栏，控制编辑状态时显示哪些按钮
   *  0:不显示任何按钮
      1:只显示内置的编辑按钮
      2:只显示自定义按钮
      3:显示所有按钮
   */
  edittingToolsShowType: PropTypes.oneOf([0, 1, 2, 3]),
  /** 新增行时，是追加，还是清空当前页数据 */
  isAppend: PropTypes.bool,
  /** 新增行时的默认条数 */
  defaultAddCount: PropTypes.number,
  /** 新增时是否忽略空数据行,当所有editor列的值均为空时,此行则视为空数据行 */
  ignoreEmptyRow: PropTypes.bool,
  /** 是否显示编辑时的input边框 */
  editorNoBorder: PropTypes.bool,

  /** 验证失败时是否显示顶部message */
  showValidateMessage: PropTypes.bool,

  /** 编辑确定事件 (changedRows,newRows,editType)=>void
   * @param {Array} changedRows-改变的数据行
   * @param {Array} newRows-改变后最新的数据
   * @param {string} editType-编辑类型;"edit":编辑;"add":新增;"delete":删除
   */
  onEditSave: PropTypes.func,

  /**
   * 默认确定按钮保存前置事件,返回false取消保存
   */
  onBeforeSave: PropTypes.func,

  /** 验证时机 */
  validateTrigger: PropTypes.oneOf(["onChange", "onBlur", "onSave"]),

  /** 验证延时 */
  validateDelay: PropTypes.number,
  /** 未修改数据时是否依然验证，为true时也会验证新增的数据，和addAsChanged区别是不会根据ignoreEmptyRow进行数据忽略 */
  alwaysValidate: PropTypes.bool,
  /** 处于编辑状态时，点击保存按钮是否始终都进行保存操作，默认情况下如果未修改数据将不会执行onEditSave */
  alwaysSave: PropTypes.bool,
  /** 新增的数据是否添加至已修改数据中，设置为true可使新增数据始终进验证，但依然会根据ignoreEmptyRow进行数据忽略 */
  addAsChanged: PropTypes.bool,
  /** 是否验证无编辑状态的列 */
  validateNoEditting: PropTypes.bool,

  /** 新增按钮前置事件，返回false不进入新增状态 ()=>bool */
  onBeforeAdd: PropTypes.func,

  /** 新增按钮事件 (addedData, newData)=>void
   * @param {Array} addedData-添加的数据行
   * @param {Array} newRows-添加后最新的数据
   */
  onAdd: PropTypes.func,

  /** 新增时的行数据模板，可通过此项设置默认行数据 (rowIndex)=>object
   * @param {numer} rowIndex
   * @returns {object} 行对象
   */
  rowTemplate: PropTypes.func,

  /** 编辑取消事件 */
  onCancel: PropTypes.func,
  /** 编辑按钮前置事件，返回false不进入编辑状态 */
  onBeforeEdit: PropTypes.func,

  /** 编辑按钮事件 */
  onEdit: PropTypes.func,
  /**
   * 删除按钮前置事件,返回false 不可删除
   */
  onBeforeDelete: PropTypes.func,
  /** 删除按钮事件 */
  onDelete: PropTypes.func,

  /** 数据是否完全受控，如若受控，请在onEditSave、onCancel中自行更新数据源 */
  dataControled: PropTypes.bool,
  /** 需要编辑的key */
  editKeys: PropTypes.array,
  /** 是否编辑所有数据,优先级大于editKeys */
  editAll: PropTypes.bool,
  /** 验证事件 */
  onValidate: PropTypes.func,

  /** actions注册 */
  actions: PropTypes.object,

  /** 编辑器属性控制 {[columnKey]:{visible:boolean,disabled:boolean,required:boolean}} */
  columnOptions: PropTypes.object,
  /** 是否单行编辑模式,单行编辑模式时，点击行即可编辑 */
  singleRowEdit: PropTypes.bool,
  onEditRowChange: PropTypes.func
};

export default EditableTable;
