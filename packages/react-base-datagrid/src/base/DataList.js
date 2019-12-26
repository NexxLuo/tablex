import React, { Component, memo } from "react";
import memoize from "memoize-one";
import { VariableSizeList as VirtualList, areEqual } from "react-window";
import { getColumnWidthStyle } from "./utils";
import ItemList from "./ItemList";

const createItemData = memoize((data, columns, rowKey) => ({
  data,
  columns,
  rowKey
}));

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
    columnColSpan,
    columnRowSpan,
    dataIndex,
    columnKey,
    columnIndex,
    width,
    minWidth,
    align,
    prependRender,
    render,
    onCell,
    cellRenderExtra,
    columnStyle,
    rowHeight
  } = props;

  let value = row[dataIndex];

  if (columnColSpan.end > columnIndex) {
    return null;
  }

  let prepend = null;
  let prependFn = prependRender;
  if (typeof prependFn === "function") {
    prepend = prependFn(value, row, rowIndex);
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

  let extraAttr = {};
  if (typeof onCell === "function") {
    extraAttr =
      onCell(row, rowIndex, Object.assign({ columnKey }, cellExtra || {})) ||
      {};
  }

  let cellRender = render;
  let cellElement = value;

  let rowColSpanStyles = {};
  let propsStyles = {};
  let hasRowSpan = false;

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
          let rowSpanEnd = rowIndex + rowSpan;
          let h = getRowsHeight(rowIndex, rowSpanEnd);

          if (columnRowSpan[columnKey]) {
            columnRowSpan[columnKey][rowKey] = {
              start: rowIndex,
              end: rowSpanEnd,
              height: h,
              rowHeight
            };
          } else {
            columnRowSpan[columnKey] = {
              [rowKey]: {
                start: rowIndex,
                end: rowSpanEnd,
                height: h,
                rowHeight
              }
            };
          }

          // columnRowSpan.start = rowIndex;
          // columnRowSpan.end = rowSpanEnd;
          // columnRowSpan.columnKey = columnKey;
          // columnRowSpan.rowSpanStyle = {
          //   top: -h + rowHeight,
          //   zIndex: 1
          // };

          rowColSpanStyles.height = h;
          rowColSpanStyles.zIndex = 2;
          cellElement = children;
          hasRowSpan = true;
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
          columnColSpan.end = colSpanEnd;

          rowColSpanStyles.width = w;
          rowColSpanStyles.zIndex = 2;

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
    rowColSpanStyles,
    columnStyle
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

  if (hasRowSpan === true) {
    cls.push("tablex-table-row-cell-rowspan");
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
    onRowComponent,
    rowRender,
    rowRenderExtra,
    cellRenderExtra,
    placeholders,
    columnRowSpan,
    autoItemSize
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

  let columnColSpan = {
    end: 0
  };

  let rowCells = columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let columnStyle = {};

    return (
      <TableCell
        key={columnKey}
        rowKey={k}
        columnKey={columnKey}
        row={row}
        rowIndex={index}
        rowHeight={style.height}
        columnIndex={i}
        columnStyle={columnStyle}
        cellRenderExtra={cellRenderExtra}
        getRowsHeight={getRowsHeight}
        getColumnsWidth={getColumnsWidth}
        columnColSpan={columnColSpan}
        columnRowSpan={columnRowSpan}
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

  delete virtualStyles.width;
  if (autoItemSize === true) {
    delete virtualStyles.height;
  }

  let rowProps = {
    className: cls.join(" "),
    "data-rowindex": index,
    style: virtualStyles,
    children: rowCells
  };

  let rowExtra = {};
  if (typeof rowRenderExtra === "function") {
    rowExtra = rowRenderExtra({
      rowData: row,
      rowKey: k,
      rowIndex: index
    });
  }

  let extraAttr = {};

  /** rowRender used to create row inner element */
  if (typeof rowRender === "function") {
    let r = rowRender({
      rowData: row,
      rowIndex: index,
      rowKey: k,
      children: rowCells,
      extra: rowExtra
    });
    if (typeof r !== "undefined") {
      rowProps.children = r;
    } else {
      if (typeof onRow === "function") {
        extraAttr = onRow(row, index, rowProps, rowExtra);
      }
    }
  } else {
    if (typeof onRow === "function") {
      extraAttr = onRow(row, index, rowProps, rowExtra);
    }
  }

  let rowElement = null;

  /** rowComponent used to create row outter element */
  if (typeof rowComponent === "function") {
    let RowCmp = rowComponent;

    let rowComponentProps = {};
    if (typeof onRowComponent === "function") {
      rowComponentProps = onRowComponent(row, index, rowProps, rowExtra);
    }

    let componentProps = {
      ...rowComponentProps,
      ...extraAttr,
      onRowProps: extraAttr,
      rowKey: k,
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
  constructor(props) {
    super(props);
    this.columnRowSpan = {}; //{rowKey:{columnKey:{ start: 0, end: 0, colspan:2,rowspan:2,width,height, columnKey: "", rowSpanStyle: {}}}}
  }

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
    let { data, rowHeight, memorizedSize = {} } = this.props;
    let row = data[index];
    let h = 40;

    if (!row) {
      let placeholderTotalHeight = this.getPlaceholderHeight();
      return placeholderTotalHeight;
    }

    let mh = memorizedSize[index];
    if (typeof mh === "number") {
      return mh;
    }

    if (typeof rowHeight === "function") {
      h = rowHeight(row, index);
    } else {
      h = rowHeight;
    }

    return h;
  };

  getRowsHeight = (start, end) => {
    let { data, rowHeight, memorizedSize = {} } = this.props;

    let endIndex = end > data.length ? data.length : end;

    let rowsHeight = 0;

    if (Object.keys(memorizedSize).length > 0) {
      let h = 0;

      for (let i = start; i < endIndex; i++) {
        let mh = memorizedSize[index];
        if (typeof mh === "number") {
          h = h + mh;
        } else {
          h = h + 40;
        }
      }
      rowsHeight = h;
    } else {
      if (typeof rowHeight === "function") {
        let h = 0;
        for (let i = start; i < endIndex; i++) {
          let row = data[i];
          if (row) {
            h = h + rowHeight(row, i);
          } else {
            break;
          }
        }
        rowsHeight = h;
      } else {
        rowsHeight = (endIndex - start) * rowHeight;
      }
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
      onRowComponent,
      style,
      onScroll,
      listRef,
      rowRender,
      rowRenderExtra,
      cellRenderExtra,
      placeholders,
      onCell,
      overscanCount = 2,
      autoItemSize,
      virtual
    } = this.props;

    let itemData = createItemData(data, columns, rowKey);

    itemData.placeholders = placeholders;

    itemData.onRow = onRow;
    itemData.rowClassName = rowClassName;
    itemData.rowComponent = rowComponent;
    itemData.onRowComponent = onRowComponent;
    itemData.rowRender = rowRender;
    itemData.cellRenderExtra = cellRenderExtra;
    itemData.columnRowSpan = this.columnRowSpan;

    itemData.getRowsHeight = this.getRowsHeight;
    itemData.getColumnsWidth = this.getColumnsWidth;
    itemData.onCell = onCell;
    itemData.rowRenderExtra = rowRenderExtra;

    itemData.autoItemSize = autoItemSize;
    itemData.virtual = virtual;

    let itemCount = data.length;

    if (this.getPlaceholderHeight() > 0) {
      itemCount = itemCount + 1;
    }

    let props = {
      style,
      height: height,
      itemSize: this.getItemSize,
      overscanCount,
      itemKey: this.getItemKey,

      innerElementType: this.innerElementType,
      itemCount: itemCount,
      onScroll: onScroll,
      itemData: itemData,
      ref: listRef,
      outerRef: outerRef
    };

    if (this.props.virtual === false) {
      return <ItemList {...props}>{TableRow}</ItemList>;
    }

    return <VirtualList {...props}>{TableRow}</VirtualList>;
  }
}

export default DataList;
