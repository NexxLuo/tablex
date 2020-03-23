import React from "react";
import PropTypes from "prop-types";

const Other = () => {
  return <div />;
};

Other.defaultProps = {
  pagination: false,
  resetScrollOffset: true,
  loading: false,
  striped: true,
  columnDropMenu: true,
  multipleSort: true,
  intl: {
    editorInputError: "输入不正确",
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

Other.propTypes = {
  /** 表格内部显示文案配置 */
  intl: PropTypes.object,

  /** 数据是否加载中 */
  loading: PropTypes.bool,

  /** 排序列配置 */
  orderNumber: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 行右键菜单渲染 */
  contextMenu: PropTypes.func,

  /** 分页 */
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

  /** 分页发生改变后是否重置滚动条位置 */
  resetScrollOffset: PropTypes.bool,

  /** 是否启用列标题配置项菜单 */
  columnDropMenu: PropTypes.bool,

  /** 根据此列进行数据分组 */
  groupedColumnKey: PropTypes.array,

  /** 默认分组列 */
  defaultGroupedColumnKey: PropTypes.array,

  /** 是否可进行列排序 */
  sortable: PropTypes.bool,

  /** 是否可多列排序 */
  multipleSort: PropTypes.bool,

  /** 排序事件 */
  onSort: PropTypes.func,

  /** 是否可进行属性配置 */
  settable: PropTypes.bool,

  /** 奇偶行颜色间隔 */
  striped: PropTypes.bool,

  /** 表格全局id，通过此id记忆表格配置，由于采用localStorage存储配置，需保证id唯一 */
  tableId: function(props, propName, componentName) {
    let count = 0;
    let v = props[propName];

    if (typeof v !== "undefined" && v !== "") {
      let tbs = document.getElementsByClassName("table-extend");

      for (let i = 0, len = tbs.length; i < len; i++) {
        const tb = tbs[i];
        if (tb) {
          const t = tb.getAttribute("data-tableid");
          if (t === v) {
            count = count + 1;

            if (count > 1) {
              break;
            }
          }
        }
      }
    }

    if (count > 1) {
      return new Error(
        ` Encountered two table with the same tableId, '${v}'.The tableId must be unique in the whole application.
                  We Recommended set the tableId based on file path.
                  eg: platform/user/index.js =>  platform-user-xxx `
      );
    }
  }
};

export default Other;
