import React, { Component } from "react";
import Table from "./Table";

class ClacTable extends Component {
  containerRef = React.createRef(null);

  resetSize = () => {
    let fn = this.props.onItemSizeChange;
    if (typeof fn === "function") {
      let container = this.containerRef.current;
      let itemSize = {};
      let totalSize = 0;

      if (container) {
        let rows = container.querySelectorAll(".tablex-table-row");
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          let h = row.offsetHeight;
          itemSize[i] = h;
          totalSize = totalSize + h;
        }
      }

      fn(itemSize, totalSize);
    }
  };

  componentDidMount() {
    this.resetSize();
  }

  render() {
    let { rowKey, data, columns, rowRender } = this.props;

    return (
      <div
        className="tablex-rowheight"
        style={{ position: "absolute", zIndex: -999, visibility: "hidden" }}
        ref={this.containerRef}
      >
        <Table
          data={data}
          rowKey={rowKey}
          containerHeight={1}
          headerHeight={0}
          columns={columns}
          showHeader={false}
          virtual={false}
          autoHeight={true}
          autoItemSize={true}
          rowHeight={40}
          rowRender={rowRender}
        />
      </div>
    );
  }
}

export default ClacTable;
