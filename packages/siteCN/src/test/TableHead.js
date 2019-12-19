import React from "react";
import Resizer from "./ColumnResizer";
import { getColumnWidthStyle, hasFlexibleColumn, isNumber } from "./utils";
import "./TableHead.css";

function treeFilter(arr, fn) {
  let treeList = arr || [];

  //根
  let roots = [];
  let j = 0;

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    let bl = fn(d, i, { depth: 0, treeIndex: j, parent: null });
    j++;

    if (bl === true) {
      if (d.children && d.children.length > 0) {
        d.children = getChildren(d, 0);
      }

      roots.push(d);
    }
  }

  function getChildren(node, depth) {
    const tempArr = node.children || [];

    const nextChildrens = [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];

      let bl = fn(d, i, { depth: depth + 1, treeIndex: j, parent: node });

      j++;

      if (bl === true) {
        if (d.children && d.children.length > 0) {
          d.children = getChildren(d, depth + 1);
        }

        nextChildrens.push(d);
      }
    }

    return nextChildrens;
  }

  return roots;
}

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
  headerCellProps,
  rowSpan
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  let cellStyles = { ...widthStyles, height };

  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  return (
    <td
      className="tablex-table-head-col"
      rowSpan={rowSpan}
      style={{ width: width }}
    >
      <div style={alignStyles}>{children}</div>

      {resizable === false ? null : (
        <Resizer
          width={width}
          columnKey={columnKey}
          onResizeStop={onColumnResizeStop}
        />
      )}
    </td>
  );
};

const ColumnGroup = ({
  title,
  children,
  flexible,
  alignStyles,
  height,
  width,
  headerCellProps,
  colSpan,
  rowSpan
}) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  let cellStyles = { height: height, width: width };
  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  return (
    <td
      className="tablex-table-head-colgroup"
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={cellStyles}
    >
      {title}
    </td>
  );
};

const renderColumns = ({
  columns,
  columnDepth,
  currentDepth,
  onColumnResizeStop,
  columnsLeafs,
  headerRowHeight
}) => {
  console.log("renderColumns 1:", columns);

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
    let colSpan = 0;
    let rowSpan = 1;

    if (d.children instanceof Array && d.children.length > 0) {
      let flexible = hasFlexibleColumn(d.children);

      let columnGroupHeight = headerRowHeight[depth];

      if (!isNumber(columnGroupHeight)) {
        columnGroupHeight = HEADER_HEIGHT;
      }

      columnGroupHeight = 40;

      let columnGroupWidth = 0;

      treeFilter([d], function(item) {
        let hasChildren = false;

        if (item.children && item.children.length > 0) {
          hasChildren = true;
        }

        if (item.__depth === columnDepth) {
          columnGroupWidth = columnGroupWidth + (item.width || 0);
          colSpan = colSpan + 1;
        } else {
          if (hasChildren === true) {
          } else {
            columnGroupWidth = columnGroupWidth + (item.width || 0);
            colSpan = colSpan + 1;
          }
        }

        return true;
      });

      if (d.key === "column-1") {
        // console.log("columnGroupWidth:", columnGroupWidth);
      }

      return (
        <ColumnGroup
          key={columnKey}
          headerCellProps={headerCellProps}
          title={titleElement}
          flexible={flexible}
          alignStyles={alignStyles}
          width={columnGroupWidth}
          height={columnGroupHeight}
          rowSpan={rowSpan}
          colSpan={colSpan}
        >
          {/* {renderColumns({
            columns: d.children,
            columnDepth,
            onColumnResizeStop,
            columnsLeafs,
            headerRowHeight
          })} */}
        </ColumnGroup>
      );
    } else {
      rowSpan = columnDepth + 1 - currentDepth;
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

    columnHeight = 40;

    console.log("Column:", d.width);

    if (d.__placeholder === true) {
      titleElement = null;
      rowSpan = 1;
      return null;
    }

    if (typeof d.__rowspan === "number") {
      // columnHeight = columnHeight + columnHeight * d.__rowspan;
      let cellStyles = headerCellProps.style || {};
      headerCellProps.style = Object.assign(cellStyles, {
        zIndex: 1,
        backgroundColor: "#ffffff"
      });
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
        rowSpan={rowSpan}
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

  renderRow = () => {
    let {
      columns,
      maxDepth,
      onColumnResizeStop,
      headerRowHeight = []
    } = this.props;

    let columnsLeafs = [];

    treeFilter(columns, function(d, i, { depth }) {
      let c = Object.assign({}, d, {
        __depth: depth
      });

      //delete c.children;
      columnsLeafs.push(c);
      return true;
    });

    console.log("columnsLeafs:", columns);

    let rows = [];
    let noChildrenColumns = columnsLeafs.filter(
      d => d.__depth === 0 && (!d.children || d.children.length === 0)
    );

    let rowsColumns = {};

    for (let i = 0; i < maxDepth + 1; i++) {
      let currentRowColumns = [];

      treeFilter(columns, function(d, j, extra) {
        let c = Object.assign({}, d);
        let depth = extra.depth;
        let hasChildren = false;
        if (d.children && d.children.length > 0) {
          hasChildren = true;
        }

        c.__depth = i;

        if (depth === i) {
          currentRowColumns.push(c);
          c.__rowspan = maxDepth - c.__depth;
        } else {
          if (hasChildren) {
            if (depth < i) {
              //currentRowColumns.push(d);
            }
          } else {
            if (depth <= i) {
              c.__placeholder = true;
              currentRowColumns.push(c);
            }
          }
        }

        return true;
      });

      rowsColumns[i] = currentRowColumns;
    }

    console.log("a:", rowsColumns);

    for (let i = 0; i < maxDepth + 1; i++) {
      let rowColumns = rowsColumns[i];

      rows.push(
        <div className="tablex-table-head-row" key={"row-" + i}>
          {renderColumns({
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

    let arr = [];

    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      arr.push(c);
    }

    return (
      <div className="tablex-table-head" style={{ width: w }}>
        {this.renderRow()}
      </div>
    );
  }
}

//export default TableHeadDefault;
export default TableHead;
