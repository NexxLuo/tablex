import React, { Fragment } from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import Table from "./Table";
import Editor from "./components/Editor";
import {
  treeToFlatten,
  treeToList,
  treeFilter,
  getTreeFromFlatData,
  cloneData,
  insertData,
  deleteData
} from "./utils";
import Button from "antd/lib/button";
import message from "antd/lib/message";
import Popconfirm from "antd/lib/popconfirm";
import Menu from "antd/lib/menu";
import Dropdown from "antd/lib/dropdown";
import Icon from "antd/lib/icon";
import orderBy from "lodash/orderBy";
import ConfigProvider from 'antd/lib/config-provider';
import "./antd/style.css";
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
      expandedRowKeys: [],
      focusedRowKeys: []
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

    if (index < 0) {
      this.setState({ focusedRowKeys: [] });
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

    let modifiedData = this.modifyData(newValues, true);

    // 当change时立即验证行
    if (this.props.validateTrigger === "onChange") {
      if (this.props.alwaysValidate === true) {
        this.validateAll();
      } else {
        this.validateRows(modifiedData);
        this.updateComponent();
      }
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
    let arr = this.getChangedRows();

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
    let rowKey = row[this.state.rowKey];
    let columnKey = column.dataIndex;
    let { valid, msg } = this.getValidate(row, columnKey) || {};

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
          columnKey={columnKey}
          onKeyDown={this.onKeyDown}
        >
          {ed}
        </Editor>
      );
      newRenderProps.children = c;
    }

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

    if (typeof callBack === "function") {
      this.setState(nextState, () => {
        callBack(arr, this.state.data, this.editType);
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

    let data = cloneData(sourceData);
    nextState.data = data;
    nextState.flatData = treeToFlatten(data).list;

    this.editType = "";
    this.changedRows = [];
    this.insertedData = [];
    this.deletedData = [];
    this.nextData = [];
    this.rowsValidation = [];
    this.setState(nextState);
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
    this.insertedData = newAddedData;

    let nextState = {
      isAddingRange: true,
      data: data.slice().concat(newAddedData),
      flatData: flatData.slice().concat(newAddedData)
    };

    if (editting === true) {
      nextState.isEditing = true;
      nextState.editKeys = newEditKeys;
    }

    this.setState(nextState);
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

  onKeyDown = (e, rowKey, columnKey) => {
    if (this.props.keyboardNavigation !== true) {
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
    let { allowSaveEmpty } = this.props;

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

    //新增的数据行key
    let addedDataKeyMap = {};

    //新增的但未更改的数据
    let unChangedAddedData = [];
    let unChangedAddedDataKeyMap = {};

    for (let i = 0; i < insertedData.length; i++) {
      let k = insertedData[i][rowKey];
      addedDataKeyMap[k] = true;

      if (changedRowsKeyMap[k] !== true) {
        unChangedAddedDataKeyMap[k] = true;
        unChangedAddedData.push(insertedData[i]);
      }
    }

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
      if (allowSaveEmpty !== true) {
        if (changedRowsKeyMap[k] !== true) {
          bl = false;
        }
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
    if (allowSaveEmpty === true) {
    } else {
      //排除 新增的但未更改的数据
      let newTreeData = treeFilter(
        data.slice(),
        d => !(unChangedAddedDataKeyMap[d[rowKey]] === true)
      );
      changedState.data = newTreeData.slice();
      //
    }

    return changedState;
  };

  completeEdit = async callBack => {
    let { allowSaveEmpty, alwaysValidate } = this.props;

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

    if (allowSaveEmpty !== true && hasModifyedData === false) {
      this.cancelEdit();
      return;
    }

    if (alwaysValidate === true) {
      bl = await this.validateAll();
    } else {
      bl = await this.validate();
    }

    if (bl === false) {
      message.error("信息录入不正确，请检查");
      return;
    }

    let fn = this.props.onComplete;

    if (typeof fn === "function") {
      fn(changedState);
    }

    this.endEdit(callBack);
  };

  editSave = async callBack => {
    let editType = this.editType;

    if (!editType) {
      console.error(
        "未检测到编辑状态,如果使用了api.xxx进行编辑，请使用completeEdit、onComplete替代..."
      );
      return;
    }

    let { allowSaveEmpty, alwaysValidate } = this.props;

    let { inserted, deleted, changed, data: newRows } = this.getModifiedData();

    let changedRows = changed;
    if (editType === "add") {
      changedRows = changed.concat(inserted);
    } else if (editType === "delete") {
      changedRows = deleted;
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

    if (allowSaveEmpty !== true && changedRows.length <= 0) {
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

    let bl = true;

    if (typeof this.props.onBeforeEdit === "function") {
      bl = this.props.onBeforeEdit(arr);
    }

    if (arr.length === 0) {
      message.error("没有可编辑的数据");
      return false;
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
    let { rowKey, selectedRowKeys, editKeys } = this.state;
    let insertedData = this.insertedData;

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
      this.deletedData = deletedRows;

      let { editKeys: nextEditKeys } = this.deleteRowsState(deletedRowKeys);

      let nextState = {
        deleteLoading: false,
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

    let insertedData = [];
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
      insertedData.push(row);
    }

    let newData = data.slice().concat(insertedData);

    this.changedRows = [];
    this.insertedData = insertedData;

    this.setState({
      data: newData,
      flatData: flatData.slice().concat(insertedData),
      editKeys: keys,
      isEditing: true,
      isEditAll: false,
      isAdding: false,
      isAddingRange: true,
      changedRows: []
    });

    if (typeof this.props.onAdd === "function") {
      this.props.onAdd(insertedData, newData, "add");
    }
  };

  editTools = () => {
    let tools = this.props.editTools || [];
    let config = this.props.editToolsConfig || {};

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
      buttons.push(
        <Button
          key={"_btnOk"}
          loading={this.state.editSaveLoading}
          onClick={this.editSave}
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
          let { selectedRowKeys = [], data = [] } = this.state;
          let hasSelectedRows = selectedRowKeys.length > 0;
          let hasData = data.length > 0;

          buttons.push(
            <Popconfirm
              key={d}
              title="确定删除选中的数据吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={this.delete}
              disabled={!hasSelectedRows}
            >
              <Button
                style={styles}
                loading={this.state.deleteLoading}
                onClick={e => {
                  e.stopPropagation();
                  if (!hasSelectedRows) {
                    if (hasData) {
                      message.warn("请选择要删除的数据");
                    } else {
                      message.warn("没有可删除的数据");
                    }
                  }
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

  onSelectChange = (selectedKeys, selectedRows, triggerKey, extra) => {
    this.setState({
      selectedRowKeys: selectedKeys.slice(),
      selectedRows: selectedRows.slice()
    });
    if (typeof this.props.onSelectChange === "function") {
      this.props.onSelectChange(selectedKeys, selectedRows, triggerKey, extra);
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

  toggleSelectOrExpand = (node, type = 0) => {
    let { rowKey } = this.state;
    let keysName = ["expandedRowKeys", "selectedRowKeys"][type];

    let keys = this.state[keysName];

    if (node) {
      let triggerKey = node[rowKey];

      let isExist = keys.indexOf(triggerKey) > -1;

      let nextKeys = [];

      let keysMap = {};

      for (let i = 0; i < keys.length; i++) {
        keysMap[keys[i]] = true;
      }

      treeFilter([node], d => {
        let k = d[rowKey];

        if (isExist) {
          keysMap[k] = false;
        } else {
          if (keysMap[k] !== true) {
            if (type === 0) {
              if (d.children instanceof Array) {
                keysMap[k] = true;
              }
            } else {
              keysMap[k] = true;
            }
          }
        }
        return true;
      });

      for (const d in keysMap) {
        if (keysMap[d] === true) {
          nextKeys.push(d);
        }
      }

      return { nextKeys, triggerKey };
    }
  };

  nextData = [];
  insertedData = [];
  insertData = ({
    data = [],
    parentKey = "",
    editing = false,
    prepend = false,
    scrollTo = true,
    startIndex = -1
  }) => {
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

    this.setState(nextState, () => {
      if (scrollTo === true) {
        this.scrollToRow(insertedRowKeys[0], "smart");
      }
    });

    return {
      data: newData,
      inserted: insertedRows,
      insertedKeys: insertedRowKeys
    };
  };

  deletedData = [];
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

    let deletedData = this.deletedData;
    this.deletedData = deletedData.slice().concat(deletedRows);
    this.nextData = newData;

    let {
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys
    } = this.deleteRowsState(deletedRowKeys);

    this.setState({
      selectedRowKeys: nextSelectedRowKeys,
      editKeys: nextEditKeys,
      data: newData,
      flatData: newFlatData
    });

    return { deleted: deletedRows, deletedKeys: deletedRowKeys, data: newData };
  };

  modifyData = (rows = [], silent = false) => {
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
        this.addToChanged(row);
        modifiedDataKeyMap[key] = row;
      }

      let addedRow = addedRowsMap[key];
      if (addedRow) {
        Object.keys(d).forEach(k => {
          if (k !== rowKey) {
            addedRow[k] = d[k];
          }
        });
        this.addToChanged(addedRow);
        modifiedDataKeyMap[key] = addedRow;
      }
    }

    if (silent === false) {
      this.forceUpdate();
    }

    for (const k in modifiedDataKeyMap) {
      if (modifiedDataKeyMap.hasOwnProperty(k)) {
        modifiedData.push(modifiedDataKeyMap[k]);
      }
    }

    Object.keys(modifiedDataKeyMap).forEach(k => {
      modifiedData.push(k);
    });

    this.nextData = data.slice();
    return modifiedData;
  };

  filterData = (fn, silent = false) => {
    let { rowKey, rawData: treeData } = this.state;

    let { list: flatData, treeProps } = treeToList(treeData, rowKey);

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

  findData = (fn, { startIndex = 0, focused = true }) => {
    let { flatData: data, rowKey } = this.state;

    let found = null;

    for (let i = startIndex, len = data.length; i < len; i++) {
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
      this.scrollToItem(found.index, "center");
      this.setState({ focusedRowKeys: [found.row[rowKey]] });
    }

    return found;
  };

  collapseAll = (silent = false) => {
    if (silent === false) {
      this.onExpandedRowsChange([]);
    }
    return [];
  };

  expandAll = (silent = false) => {
    let { data, rowKey } = this.state;

    let nextKeys = [];

    treeFilter(data, d => {
      if (d.children instanceof Array) {
        nextKeys.push(d[rowKey]);
      }
      return true;
    });

    if (silent === false) {
      this.onExpandedRowsChange(nextKeys);
    }

    return nextKeys;
  };

  expandTo = (toDepth = 0, silent = false) => {
    let { data, rowKey } = this.state;

    let nexExpandedRowKeys = [];
    let keyMap = {};

    treeFilter(data, (d, i, { depth }) => {
      if (depth <= toDepth) {
        keyMap[d[rowKey]] = depth;
        nexExpandedRowKeys.push(d[rowKey]);
      }
      return true;
    });

    if (silent === false) {
      this.onExpandedRowsChange(nexExpandedRowKeys);
    }

    return nexExpandedRowKeys;
  };

  expandToggle = (node, silent = false) => {
    let { nextKeys } = this.toggleSelectOrExpand(node, 0);
    if (silent === false) {
      this.onExpandedRowsChange(nextKeys);
    }
    return nextKeys;
  };

  selectAll = silent => {
    let { data, rowKey } = this.state;

    let nextKeys = [];

    treeFilter(data, d => {
      nextKeys.push(d[rowKey]);
      return true;
    });

    if (silent === false) {
      this.onSelectChange(nextKeys, null, "", {});
    }

    return nextKeys;
  };

  unSelectAll = silent => {
    if (silent === false) {
      this.onSelectChange([], [], null, {});
    }
    return [];
  };

  selectToggle = (node, silent = false) => {
    let { nextKeys, triggerKey } = this.toggleSelectOrExpand(node, 1);

    if (silent === false) {
      let nextRows = [];

      let keysMap = {};

      for (let i = 0; i < nextKeys.length; i++) {
        keysMap[nextKeys[i]] = true;
      }

      let { data, rowKey } = this.state;

      treeFilter(data, d => {
        let k = d[rowKey];

        if (keysMap[k] === true) {
          nextRows.push(d);
        }

        return true;
      });

      this.onSelectChange(nextKeys, nextRows, triggerKey, {});
    }
    return nextKeys;
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

  getSelections = () => {
    let { selectedRowKeys, flatData, rowKey } = this.state;
    let rows = this.getDataByKeys(selectedRowKeys, flatData, rowKey);

    return {
      keys: selectedRowKeys,
      data: rows
    };
  };

  getExpanded = () => {
    let { expandedRowKeys, flatData, rowKey } = this.state;
    let rows = this.getDataByKeys(expandedRowKeys, flatData, rowKey);

    return {
      keys: expandedRowKeys,
      data: rows
    };
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
    /** 折叠所有 */
    collapseAll: this.collapseAll.bind(this),
    /** 展开所有 */
    expandAll: this.expandAll.bind(this),
    /** 展开至指定层级 */
    expandTo: this.expandTo.bind(this),
    /** 切换节点展开、折叠状态 */
    expandToggle: this.expandToggle.bind(this),
    /** 选中所有 */
    selectAll: this.selectAll.bind(this),
    /** 取消所有选中 */
    unSelectAll: this.unSelectAll.bind(this),
    /** 切换节点选中状态 */
    selectToggle: this.selectToggle.bind(this),

    reset: this.reset.bind(this),
    isEditing: this.isEditing.bind(this),
    validateChanged: this.validate.bind(this),
    validateAll: this.validateAll.bind(this),
    getData: () => this.state.data,
    getAllData: () => {
      return {
        data: this.state.data, //当前表格的源数据
        changedData: this.getChangedRows(), //改变的行数据
        addedData: this.getInsertedData(), //添加的行数据
        currData: this.getDataRows() //当前表格状态显示的数据
      };
    },

    /** 滚动到指定行 */
    scrollToItem: this.scrollToItem.bind(this),
    /** 滚动到指定行 */
    scrollToRow: this.scrollToRow.bind(this),

    getSelections: this.getSelections.bind(this),
    getExpanded: this.getExpanded.bind(this)
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
      innerRef: this.innerTableRef,
      rowClassName: this.rowClassName
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

    return <ConfigProvider prefixCls="tablex"><Table {...props} {...newProps} /></ConfigProvider>;
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
  editorNoBorder: false,
  keyboardNavigation: true,
  editorClickBubble: false
};

EditableTable.propTypes = {
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
