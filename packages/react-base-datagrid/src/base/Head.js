import React from "react";
import Resizer from "./ColumnResizer";
import { getColumnWidthStyle, hasFlexibleColumn } from "./utils";

const HEADER_HEIGHT = 40;

const Column = ({
  children,
  alignStyles,
  width,
  minWidth,
  height,
  onColumnResizeStop,
  columnKey,
  resizable
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  let styles = { ...widthStyles, height };

  return (
    <div className="tablex-table-head-cell" style={styles}>
      <div className="tablex-table-head-cell-inner" style={alignStyles}>
        {children}
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

const ColumnGroup = ({ title, children, flexible, alignStyles }) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  return (
    <div className="tablex-table-head-group" style={styles}>
      <div
        className="tablex-table-head-group-cell"
        style={{ ...alignStyles, height: HEADER_HEIGHT }}
      >
        <div className="tablex-table-head-group-inner">{title}</div>
      </div>
      <div className="tablex-table-head-group-children" style={styles}>
        {children}
      </div>
    </div>
  );
};

const renderColumns = ({
  columns,
  columnDepth,
  onColumnResizeStop,
  columnsLeafs
}) => {
  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let alignStyles = {};

    if (d.halign) {
      alignStyles.textAlign = d.halign;
    } else if (d.align) {
      alignStyles.textAlign = d.align;
    }

    let TitleComponent = d.title;
    let titleRenderFn = d.titleRender;

    if (typeof titleRenderFn === "function") {
      TitleComponent = titleRenderFn;
    }

    let titleElement = null;

    if (typeof TitleComponent === "function") {
      titleElement = <TitleComponent column={d} />;
    } else {
      titleElement = d.title;
    }

    if (d.children instanceof Array && d.children.length > 0) {
      let flexible = hasFlexibleColumn(d.children);

      return (
        <ColumnGroup
          key={columnKey}
          title={titleElement}
          flexible={flexible}
          alignStyles={alignStyles}
        >
          {renderColumns({
            columns: d.children,
            columnDepth,
            onColumnResizeStop,
            columnsLeafs
          })}
        </ColumnGroup>
      );
    }

    let depth = d.__depth || 0;

    let h = (columnDepth - depth + 1) * HEADER_HEIGHT;

    let renderFn = d.headCellRender;

    if (typeof renderFn === "function") {
      titleElement = renderFn({ column: d, title: titleElement });
    }

    return (
      <Column
        key={columnKey}
        columnKey={columnKey}
        width={d.width}
        minWidth={d.minWidth}
        height={h}
        resizable={d.resizable}
        alignStyles={alignStyles}
        onColumnResizeStop={onColumnResizeStop}
      >
        {titleElement}
      </Column>
    );
  });
};

class TableHead extends React.Component {
  state = {
    columns: []
  };

  render() {
    let { columns, maxDepth, onColumnResizeStop, columnsLeafs } = this.props;

    let w = 0;
    columnsLeafs.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    return (
      <div className="tablex-table-head" style={{ minWidth: w }}>
        {renderColumns({
          columns,
          columnDepth: maxDepth,
          onColumnResizeStop,
          columnsLeafs
        })}
      </div>
    );
  }
}

export default TableHead;
