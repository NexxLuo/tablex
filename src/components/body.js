import React from "react";
import PropTypes from "prop-types";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const expandIcon = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
);

class TableBody extends React.Component {
  getColumn = index => {
    let { columnLeafs } = this.props;

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

  expandableEl = (columnIndex, rowIndex, row) => {
    let { rowIndent, expandedKeys = [], rowKey } = this.props;

    let indent = (row.__depth || 0) * rowIndent;

    let key = row[rowKey];

    let isExpand = false;
    let icon = "+";

    if (expandedKeys.indexOf(key) > -1) {
      isExpand = true;
      icon = "-";
    } else {
      isExpand = false;
      icon = "+";
    }

    let expandIcon = <span className="tablex-row-expand-placeholder" />;

    if (row.children) {
      expandIcon = (
        <span
          className="tablex-row-expand-icon"
          onClick={() => {
            this.props.onExpandChange(isExpand, key);
          }}
        >
          {icon}
        </span>
      );
    }

    if (columnIndex === 0) {
      return (
        <>
          {indent > 0 ? (
            <span
              className="tablex-row-indent"
              style={{ marginLeft: indent }}
            />
          ) : null}
          {expandIcon}
        </>
      );
    }
    return null;
  };

  renderCell = ({ columnIndex, rowIndex, style }) => {
    let { dataSource } = this.props;

    let column = this.getColumn(columnIndex);

    if (column) {
      let c = column.dataIndex;
      let row = dataSource[rowIndex];

      let expandableEl = this.expandableEl(columnIndex, rowIndex, row);

      let cellData = row[c];

      if (typeof column.render === "function") {
        return (
          <div className="tablex-cell" style={style}>
            {expandableEl} {column.render(cellData, row, rowIndex)}
          </div>
        );
      } else {
        return (
          <div className="tablex-cell" style={style}>
            {expandableEl}
            {cellData}
          </div>
        );
      }
    }

    return (
      <div className="tablex-cell" style={{ ...style, borderRight: "none" }} />
    );
  };

  render() {
    let { columns, columnLeafs, dataSource, onScroll } = this.props;

    let columnWidth = 0;
    columnLeafs.forEach(d => {
      columnWidth += d.width || 100;
    });

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

TableBody.defaultProps = {
  columns: [],
  columnLeafs: [],
  dataSource: [],
  rowIndent: 20,
  expandedKeys: []
};

TableBody.propTypes = {
  /**
   * 主要用于行展开
   */
  rowKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  columnLeafs: PropTypes.array.isRequired,
  dataSource: PropTypes.array.isRequired,
  onScroll: PropTypes.func,

  /**
   * @isExpand 是否展开
   * @key 受影响的行数据key
   */
  onExpandChange: PropTypes.func,
  rowIndent: PropTypes.number,
  expandedKeys: PropTypes.array
};

export default TableBody;
