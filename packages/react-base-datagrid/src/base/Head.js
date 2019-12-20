import React from "react";
import Resizer from "./ColumnResizer";
import {
  getColumnWidthStyle,
  hasFlexibleColumn,
  isFlexibleColumn,
  treeFilter,
  getColumnsWidth,
  getColumnHeight
} from "./table-head-utils";

const HEADER_HEIGHT = 40;

const ColumnPlaceolder = ({ width, minWidth, flexible, height }) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  if (flexible) {
    widthStyles.flexGrow = 1;
    widthStyles.flexShrink = 1;
  }

  let cellStyles = { height, ...widthStyles };

  let clsArr = ["tablex-table-head-cell tablex-table-head-cell-placeholder"];

  return <div className={clsArr.join(" ")} style={cellStyles}></div>;
};

const Column = ({
  children,
  alignStyles,
  flexible,
  width,
  minWidth,
  height,
  onColumnResizeStop,
  columnKey,
  resizable,
  headerCellProps,
  className = ""
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  if (flexible) {
    widthStyles.flexGrow = 1;
    widthStyles.flexShrink = 1;
  }

  let cellStyles = { height, ...widthStyles };

  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  let clsArr = ["tablex-table-head-cell"];
  className && clsArr.push(className);

  return (
    <div className={clsArr.join(" ")} {...headerCellProps} style={cellStyles}>
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
  className,
  title,
  children,
  flexible,
  alignStyles,
  height,
  width,
  headerCellProps
}) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  let cellStyles = { height, width: width };
  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  let clsArr = ["tablex-table-head-group-cell"];
  className && clsArr.push(className);

  return (
    <div className={clsArr.join(" ")} style={cellStyles}>
      {height > 0 ? (
        <div className="tablex-table-head-group-cell-inner" style={alignStyles}>
          {title}
        </div>
      ) : null}
    </div>
  );
};

const renderColumns = ({
  rowColspan,
  columns,
  columnDepth,
  currentDepth,
  onColumnResizeStop,
  headerRowHeight
}) => {
  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let columnWidth = d.width;
    let columnHeight = 0;
    let columnClass = "";
    let columnResizable = d.resizable;

    let columnWidthEndIndex = i + 1;

    // 处理行、列合并
    let colSpan = d.colSpan;
    let rowSpan = d.__rowspan__ || 1;

    if (typeof colSpan === "number") {
      if (colSpan === 0) {
        return null;
      } else {
        let colSpanEnd = i + colSpan - 1;
        columnWidthEndIndex = i + colSpan;
        rowColspan.start = i;
        rowColspan.end = colSpanEnd;
        columnResizable = false;
      }
    }
    columnWidth = getColumnsWidth({
      columns: columns,
      start: i,
      end: columnWidthEndIndex,
      maxDepth: columnDepth
    });

    let isInColspan = false;
    if (i > rowColspan.start && i <= rowColspan.end) {
      isInColspan = true;
    }

    if (isInColspan) {
      return null;
    }

    columnHeight = getColumnHeight({
      depth: currentDepth,
      rowspan: rowSpan,
      rowHeights: headerRowHeight
    });

    if (rowSpan > 1) {
      columnClass = "tablex-head-cell-rowspan";
    }

    let flexible = isFlexibleColumn(d);

    //被rowSpan掉的行，需要进行占位列渲染
    if (d.__placeholder__ === true) {
      return (
        <ColumnPlaceolder
          key={columnKey}
          flexible={flexible}
          width={columnWidth}
          minWidth={d.minWidth}
          height={columnHeight}
        ></ColumnPlaceolder>
      );
    }
    //

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

      return (
        <ColumnGroup
          key={columnKey}
          className={columnClass}
          headerCellProps={headerCellProps}
          title={titleElement}
          flexible={flexible}
          alignStyles={alignStyles}
          width={columnWidth}
          height={columnHeight}
        ></ColumnGroup>
      );
    }

    let renderFn = d.headCellRender;

    if (typeof renderFn === "function") {
      titleElement = renderFn({ column: d, title: titleElement });
    }

    return (
      <Column
        key={columnKey}
        className={columnClass}
        headerCellProps={headerCellProps}
        columnKey={columnKey}
        flexible={flexible}
        width={columnWidth}
        minWidth={d.minWidth}
        height={columnHeight}
        resizable={columnResizable}
        alignStyles={alignStyles}
        onColumnResizeStop={onColumnResizeStop}
      >
        {titleElement}
      </Column>
    );
  });
};

class TableHead extends React.Component {
  renderRow = () => {
    let {
      columns,
      maxDepth,
      onColumnResizeStop,
      headerRowHeight = [],
      columnsLeafs
    } = this.props;

    let rows = [];

    let rowsColumns = {};

    for (let i = 0; i < maxDepth + 1; i++) {
      let currentRowColumns = [];

      treeFilter(columns, (d, j, extra) => {
        let c = Object.assign({}, d);
        let depth = extra.depth;
        let hasChildren = false;
        if (d.children && d.children.length > 0) {
          hasChildren = true;
        }

        let currentDepth = i;

        if (depth === i) {
          currentRowColumns.push(c);

          if (!hasChildren) {
            let rowspan = maxDepth - currentDepth + 1;
            if (rowspan > 1) {
              c.__rowspan__ = rowspan;
            }
          }
        } else {
          if (!hasChildren) {
            if (depth <= i) {
              c.__placeholder__ = true;
              currentRowColumns.push(c);
            }
          }
        }

        if (typeof d.rowSpan === "number") {
          c.__rowspan__ = c.rowSpan;
        }

        return true;
      });

      rowsColumns[i] = currentRowColumns;
    }

    for (let i = 0; i < maxDepth + 1; i++) {
      let rowColumns = rowsColumns[i];

      let rowHeight = headerRowHeight[i] || HEADER_HEIGHT;

      let rowColspan = {};

      rows.push(
        <div
          className="tablex-head-row"
          style={{ height: rowHeight, display: "flex" }}
          key={"row-" + i}
        >
          {renderColumns({
            rowColspan: rowColspan,
            columns: rowColumns.slice(),
            columnDepth: maxDepth,
            currentDepth: i,
            onColumnResizeStop,
            columnsLeafs,
            headerRowHeight
          })}
        </div>
      );
    }

    return rows;
  };

  render() {
    let { columnsLeafs } = this.props;

    let w = 0;
    columnsLeafs.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    return (
      <div
        className="tablex-table-head"
        style={{ minWidth: w, flexDirection: "column" }}
      >
        {this.renderRow()}
      </div>
    );
  }
}

export default TableHead;
