import React, { Fragment } from "react";
import { treeToList, formatColumns } from "./utils";
import cloneDeep from "lodash/cloneDeep";

const Column = ({ title, width, height, style }) => {
  return (
    <div
      className="tablex-table-head-cell"
      style={{ width: width || 100, height: height }}
    >
      <div className="tablex-table-head-cell-inner" style={style}>
        {title}
      </div>
    </div>
  );
};

const ColumnGroup = ({ title, children, height }) => {
  return (
    <div className="tablex-table-head-group">
      <div className="tablex-table-head-group-cell" style={{ height: height }}>
        <div className="tablex-table-head-group-inner">{title}</div>
      </div>
      <div className="tablex-table-head-group-children">{children}</div>
    </div>
  );
};

const renderColumns = (columns, columnDepth) => {
  let headerHeight = 40;

  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    if (d.children instanceof Array && d.children.length > 0) {
      return (
        <ColumnGroup key={columnKey} title={d.title} height={headerHeight}>
          {renderColumns(d.children, columnDepth)}
        </ColumnGroup>
      );
    }

    let depth = d.__depth || 0;

    let h = (columnDepth - depth + 1) * headerHeight;

    let value = d.title;
    let fn = d.headerRender;
    if (typeof fn === "function") {
      value = fn();
    }

    let styles = {};
    d.align && (styles.textAlign = d.align);

    return (
      <Column
        key={columnKey}
        width={d.width}
        height={h}
        title={value}
        style={styles}
      />
    );
  });
};

class TableHead extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      rawColumns: [],
      columns: [],
      flattenColumns: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { columns, rowHeight } = nextProps;

      let { roots, leafs } = treeToList(cloneDeep(columns));

      let nextState = {
        rawColumns: columns,
        columns: roots,
        flattenColumns: leafs,
        rowHeight
      };
      return nextState;
    }
  }

  render() {
    let { columns, flattenColumns } = this.state;

    let {
      middle,
      middleWidth,
      left,
      leftWidth,
      right,
      rightWidth,
      maxDepth
    } = formatColumns(cloneDeep(columns));

    console.log("a:", columns);

    return (
      <div className="tablex-table-head">
        <div
          className="tablex-table-head-frozen-left"
          style={{
            width: leftWidth,
            flex:"0 0 auto",
            overflow: "hidden"
          }}
        >
          {renderColumns(left, maxDepth)}
        </div>
        <div
          className="tablex-table-head-main"
          style={{
            flex:"1 1 auto",
            overflow: "hidden"
          }}
        >
          {renderColumns(middle, maxDepth)}
        </div>

        <div
          className="tablex-table-head-frozen-right"
          style={{
            width: rightWidth,
            flex:"0 0 auto",
            overflow: "hidden"
          }}
        >
          {renderColumns(right, maxDepth)}
        </div>
      </div>
    );
  }
}

export default TableHead;
