import React, { Component, memo } from "react";
import memoize from "memoize-one";
import { FixedSizeList as List, areEqual } from "react-window";

const createItemData = memoize(
  (data, columns, rowKey, onRow, rowClassName, rowRenderer) => ({
    data,
    columns,
    rowKey,
    onRow,
    rowClassName,
    rowRenderer
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
    value = renderFn(value, row, rowIndex);
  }

  let styles = {};

  align && (styles.textAlign = align);

  return (
    <div className="tablex-table-row-cell" style={{ width: width }}>
      <div className="tablex-table-row-cell-inner" style={styles}>
        {prepend}
        {value}
      </div>
    </div>
  );
};

const TableRow = memo(({ data, index, style }) => {
  let { data: rows, columns, rowKey, onRow, rowClassName, rowRenderer } = data;
  let row = rows[index];
  let k = row[rowKey];

  let extraAttr = {};

  if (typeof onRow === "function") {
    extraAttr = onRow(row, index);
  }

  let cls = ["tablex-table-row", "tablex-table-row-" + index];

  if (typeof rowClassName === "function") {
    let str = rowClassName({ rowData: row, rowIndex: index });
    cls.push(str);
  }

  let rowAttrs = {
    ...extraAttr,
    className: cls.join(" "),
    "data-rowindex": index,
    style: { ...style, width: "auto", minWidth: "100%" }
  };

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

  let rowElement = <div {...rowAttrs}>{rowCells}</div>;

  if (typeof rowRenderer === "function") {
    rowElement = rowRenderer({
      rowData: row,
      rowIndex: index,
      children: rowCells,
      rowProps: rowAttrs
    });
  }

  return rowElement;
}, areEqual);

class DataList extends Component {
  render() {
    let {
      height,
      data,
      rowHeight,
      rowKey,
      outerRef,
      columns,
      onRow,
      rowClassName,
      rowRenderer,
      style,
      onScroll,
      listRef
    } = this.props;


    const itemData = createItemData(
      data,
      columns,
      rowKey,
      onRow,
      rowClassName,
      rowRenderer
    );



    return (
      <List
        style={style}
        height={height}
        itemCount={data.length}
        itemSize={rowHeight}
        onScroll={onScroll}
        itemKey={(index, itemData) => {
          let { data } = itemData;
          return data[index][rowKey];
        }}
        itemData={itemData}
        overscanRowCount={2}
        ref={listRef}
        outerRef={outerRef}
      >
        {TableRow}
      </List>
    );
  }
}

export default DataList;
