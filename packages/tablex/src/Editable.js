import React, { Fragment } from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import Table from "./Table";
import {
  treeToFlatten,
  treeFilter,
  cloneData,
  insertData,
  deleteData
} from "./utils";
import Tooltip from "antd/lib/tooltip";
import Button from "antd/lib/button";
import message from "antd/lib/message";
import Popconfirm from "antd/lib/popconfirm";
import Menu from "antd/lib/menu";
import Dropdown from "antd/lib/dropdown";
import Icon from "antd/lib/icon";
import "antd/dist/antd.css";
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
      addedData: [],
      deletedData: [],
      isEditing: false,
      isAppend: false,
      editKeys: [],
      editSaveLoading: false,
      deleteLoading: false,
      dataControled: false,
      readOnly: false,
      selectedRowKeys: [],
      expandedRowKeys: []
    };
  }

  rowsValidation = [];

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
        isAppend: nextProps.isAppend
      };

      if ("expandedRowKeys" in nextProps) {
        nextState.expandedRowKeys = nextProps.expandedRowKeys;
      }

      if ("selectedRowKeys" in nextProps) {
        nextState.selectedRowKeys = nextProps.selectedRowKeys;
      }

      let columns = cloneDeep(nextProps.columns || []);
      let columnList = treeToFlatten(columns).list;
      nextState.columns = columns;
      nextState.columnList = columnList;

      nextState.changedRows = [];

      let data = nextProps.data || nextProps.dataSource || [];

      if (prevState.dataControled === true) {
        let flatData = treeToFlatten(data).list;
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
  }

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
  addToChanged = newRow => {
    let rowKey = this.props.rowKey;
    let changedRows = this.changedRows;

    let i = changedRows.findIndex(d => d[rowKey] === newRow[rowKey]);

    if (i >= 0) {
      changedRows[i] = newRow;
    } else {
      changedRows.push(newRow);
    }

    this.changedRows = changedRows;
  };

  editChange = (data = {}, row) => {
    let newValues = [];

    if (data instanceof Array) {
      newValues = data;
    } else {
      let r = Object.assign({}, row, data);
      newValues = [r];
    }

    this.modifyData(newValues, true);

    // 当change时立即验证行
    if (this.props.validateTrigger === "onChange") {
      this.validateRows(newValues);
      this.updateComponent();
    }
  };

  setRowAttr = (row, attr = {}) => {
    let rowKey = this.props.rowKey;
    let key = row[rowKey];

    let attrs = this.rowsValidation || [];

    let i = attrs.findIndex(d => d[rowKey] === key);

    if (i > -1) {
      let fRow = attrs[i];

      if (typeof fRow.__attribute === "undefined") {
        fRow.__attribute = attr;
      } else {
        fRow.__attribute = merge({}, fRow.__attribute, attr);
      }
    } else {
      let newAttr = Object.assign({}, row);
      newAttr.__attribute = attr;
      attrs.push(newAttr);
    }

    this.rowsValidation = attrs;
  };

  getRowAttr = row => {
    let rowKey = this.props.rowKey;
    let key = row[rowKey];

    let attrs = this.rowsValidation || [];
    let attr = {};

    let i = attrs.findIndex(d => d[rowKey] === key);
    if (i > -1) {
      attr = attrs[i] || {};
    }

    return Object.assign({}, attr.__attribute || {});
  };

  getValidate = (row, key) => {
    let attr = this.getRowAttr(row);
    let r = (attr["validation"] || {})[key] || {};

    return r;
  };

  //进行异步验证的promise
  validatorAsync = [];

  validateRow = row => {
    let { columnList: columns } = this.state;

    let bl = true;

    let validation = {};

    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      const ck = c.dataIndex;

      if (typeof c.validator === "function") {
        var v = c.validator(row[ck], row);

        if (v.constructor.name === "Promise") {
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
            msg: v.valid ? "" : v.message || "输入不正确"
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

  //验证改变的数据行
  validate = async () => {
    let bl = true;
    let arr = this.changedRows;

    bl = await this.validateAsync(arr);

    return bl;
  };

  //验证当前所有数据行
  validateAll = async () => {
    let bl = true;
    let { editKeys, isEditAll, flatData } = this.state;
    let rowKey = this.props.rowKey;

    let allData = flatData;

    let arr = [];

    if (isEditAll === true) {
      arr = allData;
    } else {
      arr = allData.filter(d => {
        return editKeys.indexOf(d[rowKey]) > -1;
      });
    }

    bl = await this.validateAsync(arr);

    return bl;
  };

  editorInstance = [];
  setEditorIns = (row, column, ins) => {
    if (ins === null) {
      return;
    }

    let rowKey = row[this.props.rowKey];
    let columnKey = column.dataIndex;

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
    let { valid, msg } = this.getValidate(row, column.dataIndex) || {};

    let rendered = fn(
      value,
      row,
      index,
      values => {
        this.editChange(values, row, index);
      },
      ins => {
        this.setEditorIns(row, column, ins);
      },
      this.validate
    );

    let ed = null;

    let newRenderProps = {};

    if (React.isValidElement(rendered)) {
      ed = rendered;
    } else if (rendered) {
      ed = rendered.children;
      newRenderProps.props = rendered.props;
    }

    let c = (
      <span
        className={
          valid === false
            ? "tablex-row-cell-editor has-error"
            : "tablex-row-cell-editor no-error"
        }
        onClick={e => this.onClick(e, row, column)}
        onKeyDown={e => this.onKeyDown(e, row, column)}
      >
        <Tooltip placement="topLeft" title={msg}>
          {ed}
        </Tooltip>
      </span>
    );

    newRenderProps.children = c;

    return newRenderProps;
  };

  formatColumns = () => {
    let { columns, editKeys, isEditAll, isEditing } = this.state;

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

    if (isEditAll === true) {
      cols.forEach(d => {
        let editor = d.editor;

        if (typeof editor === "function") {
          d.render = (value, row, index) => {
            return this.renderEditor(value, row, index, d);
          };
        }
      });
    } else if (editKeys.length > 0) {
      cols.forEach(d => {
        if (typeof d.editingVisible === "boolean") {
          d.hidden = !d.editingVisible;
        }

        let editor = d.editor;

        if (typeof editor === "function") {
          let renderFn = d.render;
          d.render = (value, row, index) => {
            let bl = editKeys.findIndex(k => k === row[rowKey]) > -1;
            if (bl) {
              return this.renderEditor(value, row, index, d);
            } else {
              if (typeof renderFn === "function") {
                return renderFn(value, row, index);
              }
              return value;
            }
          };
        }
      });
    }

    arr = orderBy(arr, ["order"], ["asc"]);

    return cloneDeep(arr);
  };

  editAll = () => {
    this.setState({ isEditAll: true, isEditing: true, editKeys: [] });
  };

  endEdit = callBack => {
    let arr = [].concat(this.changedRows);

    this.changedRows = [];
    this.rowsValidation = [];

    let nextState = {
      editSaveLoading: false,
      isEditAll: false,
      isAdding: false,
      isAddingRange: false,
      isEditing: false,
      editKeys: [],
      changedRows: [],
      addedData: [],
      sourceData: cloneData(this.state.data)
    };

    if (typeof callBack === "function") {
      this.setState(nextState, () => {
        callBack(arr, this.state.data, this.editType);
      });
    } else {
      this.setState(nextState);
    }
  };

  //取消编辑
  cancelEdit = () => {
    if (typeof this.props.onCancel === "function") {
      this.props.onCancel();
    }
    this.reset();
  };

  editRows = keys => {
    this.editType = "edit";
    this.setState({ isEditAll: false, editKeys: keys, isEditing: true });
  };

  getChangedRows = () => {
    return this.changedRows;
  };

  getRows = () => {
    return this.state.data;
  };

  addRow = (r = {}, editting = true) => {
    this.addRows([r], editting);
  };

  addRows = (arr = [], editting = true) => {
    let rowKey = this.props.rowKey;
    let { editKeys, flatData, data } = this.state;

    let rowKeys = [];
    let newEditKeys = [];
    let newAddedData = [];

    this.editType = "add";

    let rows = [];

    let rowTemplate = {};

    arr.forEach((d, i) => {
      let k = d[rowKey];

      if (!k) {
        k = d[rowKey] = "__id_" + i + "_" + new Date().getTime();
      }

      rows.push(Object.assign({}, rowTemplate, d));
      rowKeys.push(k);
    });

    newEditKeys = editKeys.concat(rowKeys);
    newAddedData = [].concat(rows);

    let nextState = {
      isAddingRange: true,
      addedData: newAddedData,
      data: data.slice().concat(newAddedData),
      flatData: flatData.slice().concat(newAddedData)
    };

    if (editting === true) {
      nextState.isEditing = true;
      nextState.editKeys = newEditKeys;
    }

    this.setState(nextState);
  };

  insertData = ({
    data = [],
    parentKey = "",
    editing = false,
    prepend = false,
    scrollTo = true,
    startIndex = -1
  }) => {
    let {
      data: source,
      rowKey,
      editKeys,
      expandedRowKeys,
      addedData
    } = this.state;

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
      isAddingRange: true,
      addedData: addedData.slice().concat(insertedRows), //此处需注意，addedData与newData是不同的引用
      expandedRowKeys: nextExpandedRowKeys,
      data: newData,
      flatData: newFlatData
    };

    if (editing === true) {
      this.editType = "add";
      nextState.editKeys = editKeys.concat(insertedRowKeys);
      nextState.isEditing = true;
    }

    this.setState(nextState, () => {
      if (scrollTo === true) {
        this.scrollToRow(insertedRowKeys[0], "smart");
      }
    });

    return { data: newData, inserted: insertedRows };
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

  reset = () => {
    let nextState = {
      isEditAll: false,
      isAdding: false,
      isAddingRange: false,
      isEditing: false,
      editKeys: [],
      changedRows: [],
      addedData: []
    };

    if (this.changedRows.length > 0) {
    }

    let data = cloneData(this.state.sourceData);
    nextState.data = data;

    this.changedRows = [];
    this.rowsValidation = [];
    this.setState(nextState);
  };

  focusInput = editor => {
    if (!editor) {
      return;
    }

    if (editor.input && typeof editor.input.select === "function") {
      setTimeout(() => {
        editor.input.select();
      }, 1);
    } else if (typeof editor.focus === "function") {
      editor.focus();
    } else {
      let el = ReactDom.findDOMNode(editor);

      if (el) {
        let inputEl = el.getElementsByTagName("input")[0];
        inputEl && inputEl.focus();
        el.focus();
      }
    }
  };

  getNextEditor = (keyCode, row, column) => {
    let nextEditor = null;

    let key = this.props.rowKey;

    let rowKey = row[key];

    let columnKey = column.dataIndex;

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

  onKeyDown = (e, row, column) => {
    // e.preventDefault();
    //e.stopPropagation();

    let key = this.props.rowKey;

    let rowKey = row[key];
    let columnKey = column.dataIndex;

    let nextEditor = this.getNextEditor(e.keyCode, row, column);

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
    e.stopPropagation();
  };

  completeEdit = async callBack => {
    let changedRows = this.getChangedRows();

    let editType = this.editType;
    let { data, addedData, deletedData, rowKey } = this.state;
    let { allowSaveEmpty, alwaysValidate } = this.props;

    let newRows = data.slice();
    if (editType === "add") {
      if (allowSaveEmpty === true) {
        changedRows = addedData.slice();
      } else {
        //排除 新增的且未更改的数据
        //需要排除的key
        let excludesKeyMap = {};

        let changedRowsKeyMap = {};
        for (let i = 0; i < changedRows.length; i++) {
          let k = changedRows[i][rowKey];
          changedRowsKeyMap[k] = true;
        }

        for (let i = 0; i < addedData.length; i++) {
          let k = addedData[i][rowKey];

          if (changedRowsKeyMap[k] !== true) {
            excludesKeyMap[k] = true;
          }
        }

        let newTreeData = treeFilter(
          data.slice(),
          d => excludesKeyMap[d[rowKey]] !== true
        );

        newRows = newTreeData.slice();
        //
      }
    } else if (editType === "delete") {
      changedRows = deletedData.slice();
    }

    let bl = true;

    if (editType && editType !== "delete") {
      if (alwaysValidate === true) {
        bl = await this.validateAll();
      } else {
        bl = await this.validate();
      }

      if (bl === false) {
        message.error("信息录入不正确，请检查");
        return;
      }
    }

    if (changedRows.length <= 0) {
      this.cancelEdit();
      return;
    }

    let onEditSave = this.props.onEditSave;

    if (typeof onEditSave === "function") {
      this.setState({ editSaveLoading: true });

      let fn = onEditSave(changedRows, newRows, this.editType);

      if (fn) {
        //如果返回的是一个promise对象，则只有当调用resolve时，才触发编辑完成事件
        if (fn.constructor.name === "Promise") {
          fn.then(() => {
            this.endEdit(callBack);
          });

          fn.catch(() => {
            this.setState({ editSaveLoading: false });
          });
        } else {
          this.setState({ editSaveLoading: false });
        }
      } else {
        this.endEdit(callBack);
      }
    } else {
      this.endEdit(callBack);
    }
  };

  /**
   * "edit"：编辑 ； "add"：新增 "delete"： 删除
   */
  editType = "";

  edit = () => {
    let arr = this.state.data || [];

    if (arr.length === 0) {
      message.error("没有可编辑的数据");
      return false;
    }

    let bl = true;

    if (typeof this.props.onBeforeEdit === "function") {
      bl = this.props.onBeforeEdit();
    }

    if (bl === false) {
      return false;
    }

    this.editType = "edit";

    this.editAll();

    if (typeof this.props.onEdit === "function") {
      this.props.onEdit();
    }
  };

  deleteRowsState = (rowKeys = []) => {
    let { rowKey, selectedRowKeys, editKeys, addedData } = this.state;

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

    //删除新增状态
    let nextAddedData = [];

    for (let i = 0; i < addedData.length; i++) {
      let k = addedData[i][rowKey];
      if (keysMap[k] !== true) {
        nextAddedData.push(addedData[i]);
      }
    }

    //删除变更行
    let changedRows = this.changedRows;
    let nextChangedRows = [];
    for (let i = 0; i < changedRows.length; i++) {
      let k = changedRows[i][rowKey];
      if (keysMap[k] !== true) {
        nextChangedRows.push(changedRows[i]);
      }
    }

    this.changedRows = nextChangedRows;

    return {
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys,
      addedData: nextAddedData
    };
  };

  deleteData = rowKeys => {
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

    this.editType = "delete";

    let {
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys,
      addedData: nextAddedData
    } = this.deleteRowsState(deletedRowKeys);

    this.setState({
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys,
      addedData: nextAddedData,
      deletedData: deletedRows,
      data: newData,
      flatData: newFlatData
    });

    return deletedRows;
  };

  delete = () => {
    let { data, rowKey, selectedRowKeys = [], selectedRows = [] } = this.state;

    let bl = true;

    if (typeof this.props.onBeforeDelete === "function") {
      bl = this.props.onBeforeDelete(selectedRowKeys, selectedRows);
    }

    if (bl === false) {
      return false;
    }

    if (selectedRowKeys.length <= 0) {
      message.warn("请选择要删除的数据");
    } else {
      this.editType = "delete";

      let { newData, newFlatData, deletedRows, deletedRowKeys } = deleteData(
        data,
        selectedRowKeys,
        rowKey
      );

      let {
        editKeys: nextEditKeys,
        addedData: nextAddedData
      } = this.deleteRowsState(deletedRowKeys);

      let nextState = {
        deleteLoading: false,
        addedData: nextAddedData,
        deletedData: deletedRows,
        selectedRowKeys: [],
        editKeys: nextEditKeys,
        data: newData,
        flatData: newFlatData
      };

      let onEditSave = this.props.onEditSave;

      if (typeof onEditSave === "function") {
        this.setState({ deleteLoading: true });

        let fn = onEditSave(deletedRows, newData, this.editType);

        if (fn && typeof fn.then === "function") {
          fn.then(() => {
            this.setState(nextState);
          });
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

  addRange = rowCount => {
    let { rowTemplate, rowKey, defaultAddCount } = this.props;

    let bl = true;

    if (typeof this.props.onBeforeAdd === "function") {
      bl = this.props.onBeforeAdd();
    }

    if (bl === false) {
      return false;
    }

    this.editType = "add";

    let addCount = rowCount || defaultAddCount;

    let { data, flatData } = this.state;

    let addedData = [];
    let keys = [];

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
      addedData.push(row);
    }

    let newData = data.slice().concat(addedData);

    this.changedRows = [];

    this.setState({
      addedData,
      data: newData,
      flatData: flatData.slice().concat(addedData),
      editKeys: keys,
      isEditing: true,
      isEditAll: false,
      isAdding: false,
      isAddingRange: true,
      changedRows: []
    });

    if (typeof this.props.onAdd === "function") {
      this.props.onAdd(addedData, newData, "add");
    }
  };

  editTools = () => {
    let w = 0;

    let tools = this.props.editTools || [];
    let config = this.props.editToolsConfig || {};
    let isTop = config.position === "top";

    if (tools.length <= 0) {
      return null;
    }

    let buttons = [];

    let { isEditing } = this.state;

    let itemStyle = config.itemStyle || { marginRight: 5 };

    let okText = config.okText || "确定";
    let okIcon = config.okIcon || "";
    okIcon = okIcon ? <Icon type={okIcon} /> : null;

    let cancelText = config.cancelText || "取消";
    let cancelIcon = config.cancelIcon || "";
    cancelIcon = cancelIcon ? <Icon type={cancelIcon} /> : null;

    let addText = config.addText || "新增";
    let addIcon = config.addIcon || "";
    addIcon = addIcon ? <Icon type={addIcon} /> : null;

    let editText = config.editText || "编辑";
    let editIcon = config.editIcon || "";
    editIcon = editIcon ? <Icon type={editIcon} /> : null;

    let deleteText = config.deleteText || "删除";
    let deleteIcon = config.deleteIcon || "";
    deleteIcon = deleteIcon ? <Icon type={deleteIcon} /> : null;

    if (isEditing) {
      w = 160;
      buttons.push(
        <Button
          key={"_btnOk"}
          loading={this.state.editSaveLoading}
          onClick={this.completeEdit}
          style={{ ...itemStyle }}
        >
          {okIcon}
          {okText}
        </Button>
      );
      buttons.push(
        <Button key={"_btnCancel"} onClick={this.cancelEdit} style={itemStyle}>
          {cancelIcon}
          {cancelText}
        </Button>
      );
    } else {
      tools.forEach((d, i) => {
        w += 80;

        let styles = { ...itemStyle };

        const menu = (
          <Menu onClick={e => this.addRange(e.item.props.value)}>
            <Menu.Item key="1" value={5}>
              5 行
            </Menu.Item>
            <Menu.Item key="2" value={10}>
              10 行
            </Menu.Item>
          </Menu>
        );

        if (d === "addSingle") {
          buttons.push(
            <Button
              key={d + "_1"}
              onClick={() => this.addRange(1)}
              style={styles}
            >
              {addIcon}
              {addText}
            </Button>
          );
        }

        if (d === "add") {
          buttons.push(
            <Dropdown key={d + "_1"} overlay={menu}>
              <Button tool="add" style={styles} onClick={() => this.addRange()}>
                {addIcon} {addText}
                <Icon type="down" />
              </Button>
            </Dropdown>
          );
        }

        if (d === "edit") {
          buttons.push(
            <Button key={d + "_1"} onClick={this.edit} style={styles}>
              {editIcon}
              {editText}
            </Button>
          );
        }

        if (d === "delete") {
          buttons.push(
            <Popconfirm
              key={d}
              title="确定删除选中的数据吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={this.delete}
            >
              <Button
                style={styles}
                loading={this.state.deleteLoading}
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                {deleteIcon}
                {deleteText}
              </Button>
            </Popconfirm>
          );
        }

        if (typeof d === "function") {
          buttons.push(
            <span style={styles} key={"_fnTools_" + i}>
              {d()}
            </span>
          );
        }

        if (typeof d === "object" && d !== null) {
          let toolIcon = d.icon;
          toolIcon = toolIcon ? <Icon type={toolIcon} /> : null;
          let toolAttr = d.props || {};
          buttons.push(
            <Button
              key={"_objTools_" + i}
              onClick={d.handler}
              style={styles}
              {...toolAttr}
            >
              {toolIcon}
              {d.text}
            </Button>
          );
        }
      });
    }

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

  createToolBar = pos => {
    let { editable, readOnly, toolBarStyle } = this.props;
    let styles = {};
    if (pos === "top") {
      styles.margin = "0 0 5px 0";
    }

    styles = Object.assign(styles, toolBarStyle);

    if (editable === true && readOnly !== true) {
      let tools = this.editTools();

      if (tools !== null) {
        return (
          <div
            style={{
              backgroundColor: "#ffffff",
              marginRight: 5,
              ...styles
            }}
          >
            {tools}
          </div>
        );
      } else {
        return null;
      }
    }

    return null;
  };

  getDataRows = () => {
    let { data, addedData, isAdding, isAddingRange, isAppend } = this.state;

    let arr = data;

    let addedRows = addedData;

    if (isAdding === true || isAddingRange === true) {
      if (isAppend === true) {
        arr = data;
      } else {
        arr = addedRows;
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

  modifyData = (rows = [], silent = false) => {
    let { addedData, data } = this.state;

    let rowKey = this.props.rowKey;

    let rowsMap = {};
    let addedRowsMap = {};

    treeFilter(data, d => {
      let k = d[rowKey];
      rowsMap[k] = d;
      return true;
    });

    for (let i = 0; i < addedData.length; i++) {
      let row = addedData[i];
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
        this.addToChanged(row);
      }

      let addedRow = addedRowsMap[key];
      if (addedRow) {
        Object.keys(d).forEach(k => {
          if (k !== rowKey) {
            addedRow[k] = d[k];
          }
        });
        this.addToChanged(addedRow);
      }
    }

    if (silent === false) {
      this.forceUpdate();
    }
  };

  api = {
    addRange: this.addRange,
    addRows: this.addRows,
    delete: this.delete,

    /** 编辑指定行 */
    editRows: this.editRows,
    /** 编辑所有 */
    editAll: this.editAll,
    /** 删除数据 */
    deleteData: this.deleteData,
    /** 插入数据 */
    insertData: this.insertData,
    /** 修改数据 */
    modifyData: this.modifyData,
    /** 完成编辑 */
    completeEdit: this.completeEdit,
    /** 取消编辑 */
    cancelEdit: this.cancelEdit,
    reset: this.reset,
    isEditing: this.isEditing,
    validateChanged: this.validate,
    validateAll: this.validateAll,
    getData: () => this.state.data,
    getAllData: () => {
      return {
        data: this.state.data, //当前表格的源数据
        changedData: this.getChangedRows(), //改变的行数据
        addedData: this.state.addedData, //添加的行数据
        currData: this.getDataRows() //当前表格状态显示的数据
      };
    }
  };

  headerToolsBar = () => {
    let header = null;

    let { editToolsConfig = {} } = this.props;
    let toolBarPosition = editToolsConfig.position;

    if (toolBarPosition === "top") {
      header = this.createToolBar("top");
    }

    return header;
  };

  footerToolsBar = () => {
    let { editToolsConfig = {} } = this.props;
    let toolBarPosition = editToolsConfig.position;

    let toolBar = null;

    if (toolBarPosition === "bottom") {
      toolBar = this.createToolBar();
    }

    return toolBar;
  };

  onSelectChange = (selectedKeys, selectedRows, triggerKey) => {
    this.setState({
      selectedRowKeys: selectedKeys.slice(),
      selectedRows: selectedRows.slice()
    });
    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(selectedKeys, selectedRows, triggerKey);
    }
  };

  onExpandedRowsChange = keys => {
    this.setState({
      expandedRowKeys: keys.slice()
    });
    if (typeof this.props.onExpandedRowsChange === "function") {
      this.props.onExpandedRowsChange(keys);
    }
  };

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
      innerRef: this.innerTableRef
    };

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
    itemStyle: { marginRight: "5px" },
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
  defaultAddCount: 1,
  isAppend: false,
  validateTrigger: "onSave",
  validateDelay: 300,
  allowSaveEmpty: false,
  dataControled: false,
  alwaysValidate: false,
  editorNoBorder: false
};

EditableTable.propTypes = {
  /** 是否只读模式，只读模式下，将无法编辑，且无法触发选择事件 */
  readOnly: PropTypes.bool,
  /** 是否允许编辑 */
  editable: PropTypes.bool,
  /** 工具栏样式 */
  toolBarStyle: PropTypes.object,
  /** 工具栏，工具按钮 ['edit', 'add','delete',{icon:"",text:"",props:{},handler:Function},Function] addSingle:单行新增 */
  editTools: PropTypes.array,
  /** 工具栏，工具按钮属性配置{ position: "bottom", itemStyle: { marginRight: "5px" }, editText: "", editIcon: "", addText: "", addIcon: "", deleteText: "", deleteIcon: "", okText: "", okIcon: "", cancelText: "", cancelIcon: "" } */
  editToolsConfig: PropTypes.object,
  /** 新增行时，是追加，还是清空当前页数据 */
  isAppend: PropTypes.bool,
  /** 新增行时的默认条数 */
  defaultAddCount: PropTypes.number,

  /** 是否显示编辑时的input边框 */
  editorNoBorder: PropTypes.bool,

  /** 编辑确定事件 (changedRows,newRows,editType)=>void
   * @param {Array} changedRows-改变的数据行
   * @param {Array} newRows-改变后最新的数据
   * @param {string} editType-编辑类型;"edit":编辑;"add":新增;"delete":删除
   */
  onEditSave: PropTypes.func,
  /** 当没有改变行数据时，是否仍然执行onEditSave */
  allowSaveEmpty: PropTypes.bool,
  /** 验证时机 */
  validateTrigger: PropTypes.oneOf(["onChange", "onBlur", "onSave"]),

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
  /** 无论是否存在输入变化，是否始终验证 */
  alwaysValidate: PropTypes.bool,
  /** 数据是否完全受控，如若受控，请在onEditSave、onCancel中自行更新数据源 */
  dataControled: PropTypes.bool
};

export default EditableTable;
