import React from "react";
import TableHead from "./Head";
import "./styles.css";
import { treeToList } from "./utils";
import cloneDeep from "lodash/cloneDeep";
import DataList from "./DataList";

class Table extends React.Component {
  listRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      rawColumns: [],
      columns: [],
      columnsLeafs: [],
      rowHeight: 40,
      rowKey: "",
      showHeader: true
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, rowKey, rowHeight, showHeader } = nextProps;

      let { roots: columnsRoots, leafs: columnsLeafs } = treeToList(
        cloneDeep(columns)
      );

      let nextState = {
        rowKey,
        data,
        rawColumns: columns,
        columns: columnsRoots,
        columnsLeafs: columnsLeafs,
        rowHeight,
        showHeader
      };
      return nextState;
    }
  }

  scrollTo = scrollOffset => {
    this.listRef.current && this.listRef.current.scrollTo(scrollOffset);
  };

  resetAfterIndex(index, shouldForceUpdate) {
    this.listRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  render() {
    let {
      onScroll,
      columnsDepth,
      style,
      headStyle,
      outerRef,
      headRef,
      height,
      rowClassName,
      onRow,
      onColumnResizeStop,
      components,
      rowRender
    } = this.props;

    let {
      columns,
      columnsLeafs,
      data,
      rowHeight,
      rowKey,
      showHeader
    } = this.state;

    let TableComponents = components || {};

    return (
      <div className="tablex-table">
        {showHeader ? (
          <div className="tablex-table-head" ref={headRef} style={headStyle}>
            <TableHead
              columns={columns}
              maxDepth={columnsDepth}
              onColumnResizeStop={onColumnResizeStop}
            />
          </div>
        ) : null}
        <div className="tablex-table-body">
          <DataList
            data={data}
            columns={columnsLeafs}
            rowKey={rowKey}
            height={height}
            rowHeight={rowHeight}
            style={style}
            listRef={this.listRef}
            onScroll={onScroll}
            outerRef={outerRef}
            rowComponent={TableComponents.row}
            rowClassName={rowClassName}
            onRow={onRow}
            rowRender={rowRender}
          />
        </div>
      </div>
    );
  }
}

export default Table;
