import React, { Component, memo } from "react";
import memoize from "memoize-one";
import { VariableSizeList as List, areEqual } from "react-window";
import { getColumnWidthStyle } from "./utils";

const createItemData = memoize(
  (
    data,
    columns,
    rowKey,
    onRow,
    rowClassName,
    rowComponent,
    rowRender,
    cellRenderExtra,
    placeholders
  ) => ({
    data,
    columns,
    rowKey,
    onRow,
    rowClassName,
    rowComponent,
    rowRender,
    cellRenderExtra,
    placeholders
  })
);

class CellWithTitle extends Component {
  elRef = React.createRef();

  setTitle() {
    let { value } = this.props;
    let el = this.elRef.current;

    if (el) {
      let parentEl = el.parentNode;
      if (parentEl) {
        if (parentEl.scrollWidth > parentEl.offsetWidth) {
          el.title = value;
        } else {
          el.title = "";
        }
      }
    }
  }

  componentDidMount() {
    this.setTitle();
  }

  componentDidUpdate() {
    this.setTitle();
  }

  render() {
    let { value } = this.props;
    return <span ref={this.elRef}>{value}</span>;
  }
}

const TableCell = props => {
  let {
    row,
    rowKey,
    rowIndex,
    getRowsHeight,
    getColumnsWidth,
    rowColSpan,
    dataIndex,
    columnKey,
    columnIndex,
    width,
    minWidth,
    align,
    prependRender,
    render,
    onCell,
    cellRenderExtra
  } = props;

  let value = row[dataIndex];

  //if the column has been in colspan , don`t render it
  if (rowColSpan.end > columnIndex) {
    return null;
  }

  let prepend = null;
  let prependFn = prependRender;
  if (typeof prependFn === "function") {
    prepend = prependFn(value, row, rowIndex);
  }

  let extraAttr = {};
  if (typeof onCell === "function") {
    extraAttr = onCell(row, rowIndex, { columnKey }) || {};
  }

  let cellExtra = {};
  if (typeof cellRenderExtra === "function") {
    cellExtra = cellRenderExtra({
      rowData: row,
      rowKey: rowKey,
      rowIndex: rowIndex,
      columnKey: columnKey
    });
  }

  let cellRender = render;
  let cellElement = value;

  let rowColSpanStyles = {};
  let propsStyles = {};

  if (typeof cellRender === "function") {
    let renderValue = cellRender(value, row, rowIndex, cellExtra);
    if (!React.isValidElement(renderValue) && renderValue instanceof Object) {
      let { children = null, props = {} } = renderValue;
      let { rowSpan, colSpan, style } = props;

      propsStyles = style || {};

      cellElement = children;

      if (typeof rowSpan !== "undefined") {
        if (rowSpan === 0) {
          cellElement = null;
        } else {
          let h = getRowsHeight(rowIndex, rowIndex + rowSpan);

          rowColSpanStyles.height = h;
          rowColSpanStyles.zIndex = 1;
          //rowColSpanStyles.backgroundColor = "#ffffff";
          cellElement = children;

          if (h === 0) {
            cellElement = null;
          }
        }
      }

      if (typeof colSpan !== "undefined") {
        if (colSpan === 0) {
          cellElement = null;
        } else {
          let colSpanEnd = columnIndex + colSpan;
          let w = getColumnsWidth(columnIndex, colSpanEnd);
          rowColSpan.end = colSpanEnd;

          rowColSpanStyles.width = w;
          rowColSpanStyles.zIndex = 1;

          cellElement = children;

          if (w === 0) {
            cellElement = null;
          }
        }
      }
    } else {
      cellElement = renderValue;
    }
  }

  let style = getColumnWidthStyle({ width, minWidth });
  let cellStyles = Object.assign(
    {},
    style,
    extraAttr.style || {},
    propsStyles,
    rowColSpanStyles
  );

  let alignStyles = {};
  align && (alignStyles.textAlign = align);

  if (typeof cellElement === "string" || typeof cellElement === "number") {
    cellElement = <CellWithTitle value={cellElement} />;
  }

  let cls = ["tablex-table-row-cell"];
  if (extraAttr.className) {
    cls.push(extraAttr.className);
  }

  return (
    <div {...extraAttr} className={cls.join(" ")} style={cellStyles}>
      <div className="tablex-table-row-cell-inner" style={alignStyles}>
        {prepend}
        {cellElement}
      </div>
    </div>
  );
};

const TableRow = memo(({ data, index, style }) => {
  let {
    data: rows,
    columns,
    rowKey,
    getRowsHeight,
    getColumnsWidth,
    onRow,
    onCell,
    rowClassName,
    rowComponent,
    rowRender,
    cellRenderExtra,
    placeholders
  } = data;
  let row = rows[index];

  let placeholderTop = placeholders.top || 0;
  let placeholderBottom = placeholders.bottom || 0;
  let placeholderTotalHeight = placeholderTop + placeholderBottom;

  if (!row) {
    return (
      <div
        style={{ ...style, height: placeholderTotalHeight, zIndex: -1 }}
        className="tablex-row-placeholder"
      />
    );
  }

  let k = row[rowKey];

  let cls = ["tablex-table-row", "tablex-table-row-" + index];

  if (typeof rowClassName === "function") {
    let str = rowClassName({ rowData: row, rowIndex: index });
    cls.push(str);
  }

  let rowColSpan = {
    end: 0
  };

  let rowCells = columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;
    return (
      <TableCell
        key={columnKey}
        rowKey={k}
        columnKey={columnKey}
        row={row}
        rowIndex={index}
        columnIndex={i}
        cellRenderExtra={cellRenderExtra}
        getRowsHeight={getRowsHeight}
        getColumnsWidth={getColumnsWidth}
        rowColSpan={rowColSpan}
        onCell={onCell}
        {...d}
      />
    );
  });

  /** must be given to row element */

  let virtualStyles = Object.assign({}, style);
  if (placeholderTop > 0) {
    virtualStyles.top = style.top + placeholderTop;
  }

  let rowProps = {
    className: cls.join(" "),
    "data-rowindex": index,
    style: {
      ...virtualStyles,
      width: "auto",
      minWidth: "100%"
    },
    children: rowCells
  };

  let extraAttr = {};

  /** rowRender used to create row inner element */
  if (typeof rowRender === "function") {
    let r = rowRender({
      rowData: row,
      rowIndex: index,
      children: rowCells
    });
    if (typeof r !== "undefined") {
      rowProps.children = r;
    } else {
      if (typeof onRow === "function") {
        extraAttr = onRow(row, index, rowProps);
      }
    }
  } else {
    if (typeof onRow === "function") {
      extraAttr = onRow(row, index, rowProps);
    }
  }

  let rowElement = null;

  /** rowComponent used to create row outter element */
  if (typeof rowComponent === "function") {
    let RowCmp = rowComponent;

    let componentProps = {
      ...extraAttr,
      rowData: row,
      rowIndex: index,
      rowProps
    };

    rowElement = <RowCmp {...componentProps} />;
  } else {
    if (extraAttr.style) {
      rowProps.style = Object.assign({}, rowProps.style, extraAttr.style || {});
    }

    rowElement = <div {...extraAttr} {...rowProps} />;
  }

  return rowElement;
}, areEqual);

class DataList extends Component {
  innerElementType = ({ children, style }) => {
    let { columns = [], innerStyle = {} } = this.props;
    let w = 0;
    columns.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    if (style.height === 0) {
      style.height = "100%";
    }

    return (
      <div
        style={{ ...style, minWidth: w, position: "relative", ...innerStyle }}
      >
        {children}
      </div>
    );
  };

  getItemSize = index => {
    let { data, rowHeight } = this.props;
    let row = data[index];
    let h = 40;

    if (!row) {
      let placeholderTotalHeight = this.getPlaceholderHeight();
      return placeholderTotalHeight;
    }

    if (typeof rowHeight === "function") {
      h = rowHeight(row, index);
    } else {
      h = rowHeight;
    }

    return h;
  };

  getRowsHeight = (start, end) => {
    let { data, rowHeight } = this.props;

    let rowsHeight = 0;

    if (typeof rowHeight === "function") {
      let h = 0;
      for (let i = start; i < end; i++) {
        let row = data[i];
        if (row) {
          h = h + rowHeight(row, i);
        } else {
          break;
        }
      }
      rowsHeight = h;
    } else {
      rowsHeight = (end - start) * rowHeight;
    }

    return rowsHeight;
  };

  getColumnsWidth = (start, end) => {
    let { columns } = this.props;

    let columnsWidth = 0;

    for (let i = start; i < end; i++) {
      let d = columns[i];
      if (d) {
        let cw = getColumnWidthStyle(columns[i]).width;
        columnsWidth = cw + columnsWidth;
      } else {
        break;
      }
    }
    return columnsWidth;
  };

  getItemKey = (index, itemData) => {
    let { rowKey } = this.props;

    let { data } = itemData;
    let row = data[index];
    if (row) {
      return row[rowKey];
    }
    return "";
  };

  getPlaceholderHeight = () => {
    let { placeholders = {} } = this.props;

    let topHeight = placeholders.top || 0;
    let bottomHeight = placeholders.bottom || 0;

    return topHeight + bottomHeight;
  };

  render() {
    let {
      height,
      data,
      rowKey,
      outerRef,
      columns,
      onRow,
      rowClassName,
      rowComponent,
      style,
      onScroll,
      listRef,
      rowRender,
      cellRenderExtra,
      placeholders,
      onCell
    } = this.props;

    let itemData = createItemData(
      data,
      columns,
      rowKey,
      onRow,
      rowClassName,
      rowComponent,
      rowRender,
      cellRenderExtra,
      placeholders
    );

    itemData.getRowsHeight = this.getRowsHeight;
    itemData.getColumnsWidth = this.getColumnsWidth;
    itemData.onCell = onCell;

    let itemCount = data.length;

    if (this.getPlaceholderHeight() > 0) {
      itemCount = itemCount + 1;
    }

    let attrs = {
      style,
      height: height,
      itemSize: this.getItemSize,
      overscanRowCount: 2,
      itemKey: this.getItemKey
    };

    attrs.innerElementType = this.innerElementType;

    return (
      <List
        {...attrs}
        itemCount={itemCount}
        onScroll={onScroll}
        itemData={itemData}
        ref={listRef}
        outerRef={outerRef}
      >
        {TableRow}
      </List>
    );
  }
}

export default DataList;
