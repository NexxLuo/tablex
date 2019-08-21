import React, { Component } from "react";
import { getColumnWidthStyle } from "./utils";

const TableCell = props => {
  let {
    row,
    rowIndex,
    cellRender,
    columnKey,
    columnIndex,
    column,
    rowPosition,
    onCell
  } = props;

  let { dataIndex, width, minWidth, align } = column;

  let value = row[dataIndex];

  let cellExtra = {
    columnKey: columnKey,
    columnIndex: columnIndex,
    column: column,
    rowPosition: rowPosition
  };

  let extraAttr = {};
  if (typeof onCell === "function") {
    extraAttr = onCell(row, index, cellExtra);
  }

  if (typeof cellRender === "function") {
    value = cellRender(value, row, rowIndex, cellExtra);
  }

  let style = getColumnWidthStyle({ width, minWidth });

  let alignStyles = {};
  align && (alignStyles.textAlign = align);

  return (
    <div className="tablex-table-row-cell" style={style} {...extraAttr}>
      <div className="tablex-table-row-cell-inner" style={alignStyles}>
        {value}
      </div>
    </div>
  );
};

const TableRow = ({
  data,
  index,
  position,
  style,
  rowRender,
  cellRender,
  onRow,
  onCell
}) => {
  let { data: rows, columns, rowKey } = data;
  let row = rows[index];
  let k = row[rowKey];

  let elementIndex = position + "-" + index;

  let cls = ["tablex-table-row", "tablex-table-row-" + elementIndex];

  let rowCells = columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    return (
      <TableCell
        key={columnKey}
        rowKey={k}
        columnKey={columnKey}
        columnIndex={i}
        row={row}
        rowIndex={index}
        cellRender={cellRender}
        onCell={onCell}
        column={d}
        rowPosition={position}
      />
    );
  });

  /** must be given to row element */
  let rowProps = {
    className: cls.join(" "),
    "data-rowindex": elementIndex,
    style: { ...style, width: "auto", minWidth: "100%" },
    children: rowCells
  };

  let extraAttr = {};
  if (typeof onRow === "function") {
    extraAttr = onRow(row, index, rowProps, position);
  }

  if (typeof rowRender === "function") {
    let r = rowRender({
      rowData: row,
      rowIndex: index,
      children: rowCells,
      position: position
    });
    if (typeof r !== "undefined") {
      rowProps.children = r;
    }
  }

  let rowElement = null;

  if (extraAttr.style) {
    rowProps.style = Object.assign({}, rowProps.style, extraAttr.style || {});
  }
  rowElement = <div {...extraAttr} {...rowProps} />;

  return rowElement;
};

class DataList extends Component {
  listRef = React.createRef();

  scrollTo = ({ scrollOffset }) => {
    this.listRef.current.scrollLeft = scrollOffset;
  };

  render() {
    let {
      data,
      rowKey,
      style,
      columns,
      position,
      onRow,
      rowHeight,
      rowRender,
      cellRender,
      onCell
    } = this.props;

    let w = 0;
    columns.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    return (
      <div style={style} ref={this.listRef}>
        <div style={{ minWidth: w, position: "relative" }}>
          {data.map((d, i) => {
            return (
              <TableRow
                key={d[rowKey]}
                data={{ data: data, columns }}
                style={{ height: rowHeight }}
                index={i}
                rowRender={rowRender}
                cellRender={cellRender}
                onRow={onRow}
                onCell={onCell}
                position={position}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default DataList;
