import React from "react";
import PropTypes from "prop-types";

const Column = () => {
  return <div />;
};

Column.defaultProps = {
  title: "",
  width: undefined,
  key: "",
  dataIndex: "",
  resizable: true
};

Column.propTypes = {
  /** 列标题 */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /** 列宽 */
  width: PropTypes.number.isRequired,
  /** 列唯一key，如若不设置，将会以dataIndex作为唯一key */
  key: PropTypes.string,
  /** 列数据字段 */
  dataIndex: PropTypes.string,
  /** 冻结列 */
  fixed: PropTypes.oneOf(["left", "right"]),
  /** 是否可拖动宽度 */
  resizable: PropTypes.bool,
  /** 列自定义渲染 */
  render: PropTypes.func,
  /** 编辑列验证  (value,row,rowIndex) => React.Element ;
   * @param {*} value
   * @param {object} row
   * @param {number} rowIndex
   * @returns {React.Element}
   */
  validator: PropTypes.func,
  /** 编辑列控件 (value:any,row:object,rowIndex:number,onchange:func,ref:func,validate:func) => React.Element ;
   */
  editor: PropTypes.func
};

export default Column;
