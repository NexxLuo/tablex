import React, { Component, memo } from "react";
import memoize from "memoize-one";
import { VariableSizeList as List, areEqual } from "react-window";

const createItemData = memoize(
  (data, columns, rowKey, onRow, rowClassName, rowComponent, rowRender) => ({
    data,
    columns,
    rowKey,
    onRow,
    rowClassName,
    rowComponent,
    rowRender
  })
);

const TableCell = props => {
  let { row, rowIndex, dataIndex, width, align, prependRender, render } = props;

  let value = row[dataIndex];

  let prepend = null;
  let prependFn = prependRender;
  if (typeof prependFn === "function") {
    prepend = prependFn(value, row, rowIndex);
  }

  let renderFn = render;
  if (typeof renderFn === "function") {
    let extra = {
      depth: row.__depth,
      parents: row.__parents
    };
    value = renderFn(value, row, rowIndex, extra);
  }

  let styles = {};

  align && (styles.textAlign = align);

  let style = {};
  style.width = width || 100;

  if (typeof width === "undefined") {
    style.flexGrow = 1;
    style.flexShrink = 1;
  }

  return (
    <div className="tablex-table-row-cell" style={style}>
      <div className="tablex-table-row-cell-inner" style={styles}>
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
    rowRender
  } = data;
  let row = rows[index];
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
        row={row}
        rowIndex={index}
        columnIndex={i}
        {...d}
      />
    );
  });

  /** must be given to row element */
  let rowProps = {
    className: cls.join(" "),
    "data-rowindex": index,
    style: { ...style, width: "auto", minWidth: "100%" },
    children: rowCells
  };

  let extraAttr = {};

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
        extraAttr = onRow(row, index);
      }
    }
  } else {
    if (typeof onRow === "function") {
      extraAttr = onRow(row, index);
    }
  }

  let rowElement = null;

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
    rowElement = <div {...extraAttr} {...rowProps} />;
  }

  return rowElement;
}, areEqual);

class DataList extends Component {
  innerElementType = ({ children, style }) => {
    let columns = this.props.columns || [];
    let w = 0;
    columns.forEach(d => {
      w = w + (d.width || 100);
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
    return row.height || rowHeight;
  };

  getItemKey = (index, itemData) => {
    let { rowKey } = this.props;

    let { data } = itemData;
    return data[index][rowKey];
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
      rowRender
    } = this.props;

    let itemData = createItemData(
      data,
      columns,
      rowKey,
      onRow,
      rowClassName,
      rowComponent,
      rowRender
    );

    let itemCount = data.length;

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
