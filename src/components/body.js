import React from "react";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
);

const columnWidths = new Array(1000)
  .fill(true)
  .map(() => 75 + Math.round(Math.random() * 50));
const rowHeights = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50));

class TableBody extends React.Component {
  state = {
    dataSource: [],
    columns: [{}]
  };

  getColumn = index => {
    let { columns, columnLeafs, dataSource } = this.props;

    return columnLeafs[index];
  };

  getColumnWidth = () => {
    let { columnLeafs } = this.props;

    let cw = 0;
    columnLeafs.forEach(d => {
      cw += d.width || 100;
    });

    return cw;
  };

  columnWidth = (index, width) => {
    let column = this.getColumn(index);
    let cw = this.getColumnWidth();

    if (column) {
      return column.width || 100;
    }

    return width - cw - 6;
  };

  renderCell = ({ columnIndex, rowIndex, style }) => {
    let { columns, dataSource } = this.props;

    let column = this.getColumn(columnIndex);

    if (column) {
      let c = column.dataIndex;
      let row = dataSource[rowIndex];

      return (
        <div className="__cell" style={style}>
          {row[c]}
        </div>
      );
    }

    return <div className="__cell" style={{ ...style, borderRight: "none" }} />;
  };

  render() {
    let { columns, columnLeafs, dataSource, onScroll } = this.props;

    let columnWidth = 0;
    columnLeafs.forEach(d => {
      columnWidth += d.width || 100;
    });

    // let cols = columns.concat([{
    //   __placeholdercolumn:true
    // }])

    return (
      <AutoSizer>
        {({ height, width }) => {
          let len = columnLeafs.length;

          if (width > columnWidth) {
            len = len + 1;
          }

          return (
            <Grid
              columnCount={len}
              columnWidth={i => this.columnWidth(i, width)}
              height={height}
              rowCount={dataSource.length}
              rowHeight={() => 35}
              width={width}
              onScroll={onScroll}
            >
              {this.renderCell}
            </Grid>
          );
        }}
      </AutoSizer>
    );
  }
}

export default TableBody;
