import React from "react";
import BaseTable from "./BaseTable";
import PropTypes from "prop-types";

/**
 * 表格组件
 */
const Table = props => {
  return <BaseTable {...props} />;
};

Table.defaultProps = {
  rowKey: "key",
  columns: [],
  dataSource: [],
  selectMode: "single",
  selectedRowKeys: [],
  disabledSelectKeys: [],
  orderNumber: false,
  checkStrictly: true,
  resizable: true
};

Table.propTypes = {
  /** 数据行主键字段 */
  rowKey: PropTypes.string.isRequired,
  /** 列 */
  columns: PropTypes.array.isRequired,
  /** 行数据源 */
  dataSource: PropTypes.array,
  /** table实例回调
   * (ins:React.Element) => void
   */
  initRef: PropTypes.func,
  /** 选择模式：多选 单选 不可选择 */
  selectMode: PropTypes.oneOf(["multiple", "single", "none"]),
  /** 选中的行键值 */
  selectedRowKeys: PropTypes.array,
  /** 将被禁用选中的行key */
  disabledSelectKeys: PropTypes.array,
  /**
   * 行选择事件
   *  (selectedKeys,selectedRows,triggerKey) => void
   * */
  onSelectChange: PropTypes.func,
  /** 是否显示序号列 */
  orderNumber: PropTypes.bool,
  /** 列是否可设置宽度，优先级小于column.resizable */
  resizable: PropTypes.bool,
  /** 多选模式是否级联控制checkbox选中状态 */
  checkStrictly: PropTypes.bool,

  /** 展开的行键值 */
  expandedRowKeys: PropTypes.array,
  /** 
   * 行展开事件 
   * (expandedRowKeys:Array) => void
   * */
  onExpandedRowsChange: PropTypes.func,

  /** 
   * 展开时加载children的方法 
   * (row:object) => Promise
   * */
  loadChildrenData: PropTypes.func,
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

export default Table;
