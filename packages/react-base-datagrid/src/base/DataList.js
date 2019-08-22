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

const TableCell = props => {
  let {
    row,
    rowKey,
    rowIndex,
    dataIndex,
    columnKey,
    width,
    minWidth,
    align,
    prependRender,
    render,
    onCell,
    cellRenderExtra
  } = props;

  let value = row[dataIndex];

  let prepend = null;
  let prependFn = prependRender;
  if (typeof prependFn === "function") {
    prepend = prependFn(value, row, rowIndex);
  }

  let extraAttr = {};
  if (typeof onCell === "function") {
    extraAttr = onCell(row, index) || {};
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
  if (typeof cellRender === "function") {
    value = cellRender(value, row, rowIndex, cellExtra);
  }

  let style = getColumnWidthStyle({ width, minWidth });
  let cellStyles = Object.assign({}, style, extraAttr.style || {});

  let alignStyles = {};
  align && (alignStyles.textAlign = align);

  return (
    <div className="tablex-table-row-cell" {...extraAttr} style={cellStyles}>
      <div className="tablex-table-row-cell-inner" style={alignStyles}>
        {prepend}
        {value}
      </div>
    </div>
  );
};

const TableRow = memo(({ data, index, style }) => {
  let {
    data: rows,
    columns,
    rowKey,
    onRow,
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
    let columns = this.props.columns || [];
    let w = 0;
    columns.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    if (style.height === 0) {
      style.height = "100%";
    }

    return (
      <div style={{ ...style, minWidth: w, position: "relative" }}>
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
      placeholders
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
