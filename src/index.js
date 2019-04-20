import React from "react";
import PropTypes from "prop-types";
import TableBody from "./components/body";
import TableHead from "./components/head";
import "./index.css";
import { treeToList } from "./tree-data-utils";

class Table extends React.Component {
  state = {
    columns: [],
    dataSource: []
  };

  onBodyScroll = ({ scrollLeft }) => {
    let head = this.refs["head"];
    head.scrollTo(scrollLeft, 0);
  };

  render() {
    let { columns, dataSource } = this.props;

    let { leafs, list } = treeToList(columns);

    return (
        <div className="tablex">
          <div className="tablex-head" ref="head">
            <TableHead columns={columns} columnLeafs={leafs} />
          </div>

          <div className="tablex-body">
            <TableBody
              columns={columns}
              columnLeafs={leafs}
              dataSource={dataSource}
              onScroll={this.onBodyScroll}
            />
          </div>
        </div>
    );
  }
}

Table.defaultProps = {
  columns: [],
  dataSource: []
};

Table.propTypes = {
  /**
   * 表格列
   *
   */
  columns: PropTypes.array.isRequired,

  /**
   * 表格数据
   */
  dataSource: PropTypes.array.isRequired
};

export default Table;
