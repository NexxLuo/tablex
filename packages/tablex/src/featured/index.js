import React from "react";
import FeaturedTable from "./Editable";
import PropTypes from "prop-types";
import "./styles.css";

const Table = React.forwardRef((props, ref) => (
  <FeaturedTable {...props} ref={ref} />
));

Table.defaultProps = {
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

Table.propTypes = {
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

export default Table;
