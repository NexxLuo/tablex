import React, { Component } from "react";
import Table from "./Table";
import { getParentElement } from "./utils";
class ClacTable extends Component {
  containerRef = React.createRef(null);

  state = { data: [] };

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {
      needReset: false
    };

    if (nextProps.data !== prevState.data) {
      nextState.needReset = true;
      nextState.data = nextProps.data;
    }

    return nextState;
  }
  resetSize = () => {
    let fn = this.props.onItemSizeChange;
    if (typeof fn === "function") {
      let container = this.containerRef.current;
      let itemSize = {};
      let totalSize = 0;

      if (container) {
        if (container.offsetHeight <= 0) {
          return;
        }
        let rows = container.querySelectorAll(".tablex-table-row");
        let rowsContainer = getParentElement(container, ".tablex-container");

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          let p = getParentElement(row, ".tablex-container");

          if (p === rowsContainer) {
            let rowIndex = row.dataset.rowindex;

            let h = row.offsetHeight;

            let rc = row.firstChild;

            if (rc && rc.classList.contains("tablex-row-expandedRowRender")) {
              h = rc.offsetHeight;
            }

            itemSize[rowIndex] = h;
            totalSize = totalSize + h;
          }
        }
      }

      fn(itemSize, totalSize);
    }
  };

  componentDidMount() {
    if (this.state.needReset) {
      this.resetSize();
    }
  }

  componentDidUpdate() {
    if (this.state.needReset) {
      this.resetSize();
    }
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
          disabledRowSpan={true}
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
