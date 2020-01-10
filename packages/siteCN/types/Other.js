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
  columnDropMenu: true
};

Other.propTypes = {
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
  groupedColumnKey: PropTypes.string,

  /** 默认分组列 */
  defaultGroupedColumnKey: PropTypes.string,

  /** 是否可进行列排序 */
  sortable: PropTypes.bool,

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
