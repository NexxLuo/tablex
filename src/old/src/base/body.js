import React from "react";
import PropTypes from "prop-types";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import LoadingIcon from "../components/loadingIcon";

class TableBody extends React.Component {
  gridRef = React.createRef();

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
    let sw = this.props.scrollbarWidth;

    if (column) {
      return column.width || 100;
    }

    return width - cw - sw;
  };

  /**
   * 行是否正在加载子级
   */
  isLoadingChildren = key => {
    let { loadingKeys } = this.props;

    return loadingKeys.indexOf(key) > -1;
  };

  expandableEl = (columnIndex, rowIndex, row) => {
    let { rowIndent, expandedKeys = [], rowKey } = this.props;

    let indent = (row.__depth || 0) * rowIndent;

    let key = row[rowKey];

    let isLoading = this.isLoadingChildren(key);

    let isExpand = false;
    let icon = "+";

    if (expandedKeys.indexOf(key) > -1) {
      isExpand = true;
      icon = "-";
    } else {
      isExpand = false;
      icon = "+";
    }

    let iconFlag = <span className="tablex-row-expand-placeholder" />;

    if (row.children) {
      iconFlag = (
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

    if (isLoading === true) {
      iconFlag = <LoadingIcon />;
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
          {iconFlag}
        </>
      );
    }
    return null;
  };

  renderCell = ({ columnIndex, rowIndex, style }) => {
    let { dataSource } = this.props;

    if (dataSource.length === 0) {
      return <div />;
    }

    let column = this.getColumn(columnIndex);

    let attr = {};

    // if (columnIndex===0) {
    //   attr={
    //     position:"sticky",
    //     zIndex:1,
    //     left:0
    //   }
    // }

    if (column) {
      let c = column.dataIndex;
      let row = dataSource[rowIndex];

      let expandableEl = this.expandableEl(columnIndex, rowIndex, row);

      let cellData = row[c];

      let table_cell = null;

      if (typeof column.render === "function") {
        table_cell = (
          <div className="tablex-cell" style={style}>
            {expandableEl} {column.render(cellData, row, rowIndex)}
          </div>
        );
      } else {
        table_cell = (
          <div className="tablex-cell" style={{ ...style, ...attr }}>
            {expandableEl}
            {cellData}
          </div>
        );
      }

      return table_cell;
    }

    return (
      <div className="tablex-cell" style={{ ...style, borderRight: "none" }} />
    );
  };

  renderRow = ({ index, style }) => {
    console.log("renderRow")
    let columns = this.props.columns || [];
    return (
      <div className="tablex-row" style={{ ...style }}>
        {columns.map((column, columnIndex) => {
          return this.renderCell({
            columnIndex,
            rowIndex: index,
            style: { display: "inline-block", width: column.width }
          });
        })}
      </div>
    );
  };


  
  renderRow2 = (args) => {
    console.log("renderRow:",args)
    let columns = this.props.columns || [];
    return <div>{args.rowIndex},{args.columnIndex}</div>
  };

  scrollTo = pos => {
    this.gridRef.current && this.gridRef.current.scrollTo(pos);
  };

  onScroll = ({ scrollLeft, scrollTop }) => {
    console.log("onScroll:");
    if (typeof this.props.onScroll === "function") {
      this.props.onScroll({ scrollLeft, scrollTop });
    }
  };

  render() {
    let { columns, columnLeafs, dataSource, style } = this.props;
    let columnWidth = 0;
    columnLeafs.forEach(d => {
      columnWidth += d.width || 100;
    });

    let rowCount = dataSource.length;

    return (
      <AutoSizer>
        {({ height, width }) => {
          let len = columnLeafs.length;

          if (width > columnWidth) {
            len = len + 1;
          }

          if (dataSource.length === 0) {
            rowCount = 1;
          }

          return (
            <>
              <Grid
                style={{ ...style }}
                columnCount={len}
                columnWidth={i => this.columnWidth(i, width)}
                height={height}
                rowCount={rowCount}
                rowHeight={() => 35}
                width={width}
                onScroll={this.onScroll}
                ref={this.gridRef}
              >
                {this.renderCell}
              </Grid>
            </>
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
  expandedKeys: [],
  loadingKeys: [],
  scrollbarWidth: 6
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
  expandedKeys: PropTypes.array,
  loadingKeys: PropTypes.array,
  scrollbarWidth: PropTypes.number
};

export default TableBody;
