import React from "react";
import PropTypes from "prop-types";

const Editable = () => {
  return <div />;
};

Editable.defaultProps = {
  editable: false,
  readOnly: false,
  editTools: ["edit", "add"],
  editToolsConfig: {
    position: "bottom",
    wrapper: null,
    props: {},
    itemStyle: { marginLeft: "5px" },
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
  ignoreEmptyRow: true,
  validateTrigger: "onSave",
  validateDelay: 300,
  dataControled: false,
  editorNoBorder: false,
  showValidateMessage: true,
  keyboardNavigation: true,
  editorClickBubble: false,
  editKeys: [],
  editAll: false
};

Editable.propTypes = {
  /** 是否允许编辑 */
  editable: PropTypes.bool,

  /** 是否启用键盘导航 */
  keyboardNavigation: PropTypes.bool,

  /** 编辑器是否允许点击事件冒泡 */
  editorClickBubble: PropTypes.bool,

  /** 是否只读模式，只读模式下，将无法编辑，且无法触发选择事件 */
  readOnly: PropTypes.bool,

  /** 是否显示编辑时的input边框 */
  editorNoBorder: PropTypes.bool,

  /** 验证失败时是否显示顶部message */
  showValidateMessage: PropTypes.bool,

  /** 工具栏，工具按钮 ['edit', 'add','delete',{icon:"",text:"",props:{},handler:Function},Function] addSingle:单行新增 */
  editTools: PropTypes.array,
  /** 工具栏，工具按钮属性配置{ wrapper:function,props:{},position: "bottom", itemStyle: { marginRight: "5px" }, editText: "", editIcon: "", addText: "", addIcon: "", deleteText: "", deleteIcon: "", okText: "", okIcon: "", cancelText: "", cancelIcon: "" } */
  editToolsConfig: PropTypes.object,
  /** 新增行时，是追加，还是清空当前页数据 */
  isAppend: PropTypes.bool,
  /** 新增时是否忽略空数据行,当所有editor列的值均为空时,此行则视为空数据行 */
  ignoreEmptyRow: PropTypes.bool,
  /** 新增行时的默认条数 */
  defaultAddCount: PropTypes.number,

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

  /** 数据是否完全受控，如若受控，请在onEditSave、onCancel中自行更新数据源 */
  dataControled: PropTypes.bool,

  /** 内置编辑按钮保存事件 (changedRows,newRows,editType)=>void|Promise  Promise中如果捕获了异常，需进行再次抛出，否则内部可能无法正常进行后续操作
   * @param {Array} changedRows-改变的数据行
   * @param {Array} newRows-改变后最新的数据
   * @param {string} editType-编辑类型;"edit":编辑;"add":新增;"delete":删除
   */
  onEditSave: PropTypes.func,
  /** api.completeEdit 触发此事件
   * @param {changed:[],inserted:[],deleted:[],data:[]} --包含修改、新增、删除的数据，以及最新的表格数据data
   */
  onComplete: PropTypes.func,
  /** 需要编辑的key */
  editKeys: PropTypes.array,
  /** 是否编辑所有数据,优先级大于editKeys */
  editAll: PropTypes.bool,
  /** 验证事件 */
  onValidate: PropTypes.func
};

export default Editable;
