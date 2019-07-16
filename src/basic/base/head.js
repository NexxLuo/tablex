import React from "react";
import Resizer from "./ColumnResizer";

const Column = ({
  title,
  width,
  height,
  style,
  onColumnResizeStop,
  columnKey,
  resizable
}) => {
  let styles = { height };

  styles.width = width || 100;

  if (typeof width === "undefined") {
    styles.flexGrow = 1;
    style.flexShrink = 1;
  }

  return (
    <div className="tablex-table-head-cell" style={styles}>
      <div className="tablex-table-head-cell-inner" style={style}>
        {title}
      </div>
      {resizable === false ? null : (
        <Resizer
          width={width}
          columnKey={columnKey}
          onResizeStop={onColumnResizeStop}
        />
      )}
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

const renderColumns = (columns, columnDepth, onColumnResizeStop) => {
  let headerHeight = 40;

  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    if (d.children instanceof Array && d.children.length > 0) {
      return (
        <ColumnGroup key={columnKey} title={d.title} height={headerHeight}>
          {renderColumns(d.children, columnDepth, onColumnResizeStop)}
        </ColumnGroup>
      );
    }

    let depth = d.__depth;

    let h = (columnDepth - depth + 1) * headerHeight;

    let value = d.title;
    let fn = d.headRender;
    if (typeof fn === "function") {
      value = fn({ column: d });
    }

    let styles = {};
    d.align && (styles.textAlign = d.align);

    return (
      <Column
        key={columnKey}
        columnKey={columnKey}
        width={d.width}
        height={h}
        title={value}
        style={styles}
        resizable={d.resizable}
        onColumnResizeStop={onColumnResizeStop}
      />
    );
  });
};

class TableHead extends React.Component {
  state = {
    columns: []
  };

  render() {
    let { columns, maxDepth, onColumnResizeStop } = this.props;

    return <>{renderColumns(columns, maxDepth, onColumnResizeStop)} </>;
  }
}

export default TableHead;
