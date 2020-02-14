import React, { Component } from "react";
import Table from "./Table";

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
