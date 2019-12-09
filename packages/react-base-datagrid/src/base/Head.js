import React from "react";
import Resizer from "./ColumnResizer";
import { getColumnWidthStyle, hasFlexibleColumn, isNumber } from "./utils";

const HEADER_HEIGHT = 40;

const Column = ({
  children,
  alignStyles,
  width,
  minWidth,
  height,
  onColumnResizeStop,
  columnKey,
  resizable,
  headerCellProps
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  let cellStyles = { ...widthStyles, height };

  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  return (
    <div
      className="tablex-table-head-cell"
      {...headerCellProps}
      style={cellStyles}
    >
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

const ColumnGroup = ({
  title,
  children,
  flexible,
  alignStyles,
  height,
  headerCellProps
}) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  let cellStyles = { height: height };
  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  return (
    <div className="tablex-table-head-group" style={styles}>
      {height > 0 ? (
        <div
          className="tablex-table-head-group-cell"
          {...headerCellProps}
          style={cellStyles}
        >
          <div className="tablex-table-head-group-inner" style={alignStyles}>
            {title}
          </div>
        </div>
      ) : null}
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
  columnsLeafs,
  headerRowHeight
}) => {
  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let depth = d.__depth || 0;

    let alignStyles = {};

    if (d.halign) {
      alignStyles.textAlign = d.halign;
    }

    let TitleComponent = d.title;
    let titleRenderFn = d.titleRender;
    let onHeaderCell = d.onHeaderCell;

    let headerCellProps = {};
    if (typeof onHeaderCell === "function") {
      headerCellProps = onHeaderCell(d);
    }

    if (typeof titleRenderFn === "function") {
      TitleComponent = titleRenderFn;
    }

    let titleElement = null;

    if (typeof TitleComponent === "function") {
      titleElement = <TitleComponent column={d} {...headerCellProps} />;
    } else {
      titleElement = d.title;
    }

    if (d.children instanceof Array && d.children.length > 0) {
      let flexible = hasFlexibleColumn(d.children);

      let columnGroupHeight = headerRowHeight[depth];

      if (!isNumber(columnGroupHeight)) {
        columnGroupHeight = HEADER_HEIGHT;
      }

      return (
        <ColumnGroup
          key={columnKey}
          headerCellProps={headerCellProps}
          title={titleElement}
          flexible={flexible}
          alignStyles={alignStyles}
          height={columnGroupHeight}
        >
          {renderColumns({
            columns: d.children,
            columnDepth,
            onColumnResizeStop,
            columnsLeafs,
            headerRowHeight
          })}
        </ColumnGroup>
      );
    }

    let renderFn = d.headCellRender;

    if (typeof renderFn === "function") {
      titleElement = renderFn({ column: d, title: titleElement });
    }

    let columnHeight = 0;
    for (let i = depth; i < columnDepth + 1; i++) {
      let h = headerRowHeight[i];

      if (!isNumber(h)) {
        h = HEADER_HEIGHT;
      }

      columnHeight = columnHeight + h;
    }

    if (columnHeight === 0) {
      columnHeight = HEADER_HEIGHT;
    }

    return (
      <Column
        key={columnKey}
        headerCellProps={headerCellProps}
        columnKey={columnKey}
        width={d.width}
        minWidth={d.minWidth}
        height={columnHeight}
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
    let {
      columns,
      maxDepth,
      onColumnResizeStop,
      columnsLeafs,
      headerRowHeight = []
    } = this.props;

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
          columnsLeafs,
          headerRowHeight
        })}
      </div>
    );
  }
}

export default TableHead;
