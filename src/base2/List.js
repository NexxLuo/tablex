import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./styles.css";

const rowKeyField = "";

const Row = ({ index, style }) => <div style={style}>Row {index}</div>;

const Cell = ({ row, column, columnIndex }) => {
  let temp = {};
  if (columnIndex === 0) {
    temp = {
      position: "sticky",
      left: 0
    };
  }

  return (
    <div className="tablex-row-cell" style={{ width: column.width }}>
      <div className="tablex-row-cell-inner"> {row[column.dataIndex]}</div>
    </div>
  );
};


const renderRow = ({ index, style, data }) => {
  let { data: rows, columns, rowKey } = data;
  let row = rows[index];

  let key = row[rowKey];

  return (
    <div className="tablex-row" style={{ ...style, width: "auto" }}>
      {columns.map((d, i) => {
        return (
          <Cell key={d.key} row={rows[index]} column={d} columnIndex={i} />
        );
      })}
    </div>
  );
};

class DataList extends React.Component {
  listRef = React.createRef();
  outterRef = React.createRef();

  scrollTo = ({ scrollTop }) => {
    this.listRef.current && this.listRef.current.scrollTo(scrollTop);

    if (this.outterRef.current) {
      //this.outterRef.current.scrollTop = scrollTop;
    }
  };

  render() {
    let {
      height,
      width,
      columns,
      data,
      rowHeight = 40,
      rowKey,
      outerRef,
      onScroll
    } = this.props;

    return (
      <List
        className="tablex"
        ref={this.listRef}
        height={height}
        itemCount={data.length}
        itemSize={rowHeight}
        onScroll={onScroll}
        outerRef={this.outterRef}
        itemKey={(index, itemData) => {
          let { data } = itemData;
          return data[index][rowKey];
        }}
        itemData={{ data, columns, rowKey: rowKey }}
        overscanRowCount={2}
      >
        {renderRow}
      </List>
    );
  }
}

export default DataList;
