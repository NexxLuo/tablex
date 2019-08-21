import React from "react";
import TableHead from "./Head";
import "./styles.css";
import { getFlattenColumns } from "./utils";
import cloneDeep from "lodash/cloneDeep";
import DataList from "./DataList";
import FrozenList from "./FrozenList";

class Table extends React.Component {
  listRef = React.createRef();
  extraTopRef = React.createRef();
  extraBottomRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      rawColumns: [],
      columns: [],
      columnsLeafs: [],
      rowKey: "",
      showHeader: true
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, rowKey, showHeader } = nextProps;

      let { roots: columnsRoots, leafs: columnsLeafs } = getFlattenColumns(
        cloneDeep(columns)
      );

      let nextState = {
        rowKey,
        data,
        rawColumns: columns,
        columns: columnsRoots,
        columnsLeafs: columnsLeafs,
        showHeader
      };
      return nextState;
    }
  }

  scrollTo = scrollOffset => {
    this.listRef.current && this.listRef.current.scrollTo(scrollOffset);
  };

  scrollToItem = (index, align) => {
    this.listRef.current && this.listRef.current.scrollToItem(index, align);
  };

  resetAfterIndex(index, shouldForceUpdate) {
    this.listRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  extraScrollTo = scrollOffset => {
    this.extraTopRef.current &&
      this.extraTopRef.current.scrollTo({ scrollOffset });
    this.extraBottomRef.current &&
      this.extraBottomRef.current.scrollTo({ scrollOffset });
  };

  renderHead() {
    let {
      columnsDepth,
      headRef,
      onColumnResizeStop,
      components,
      headStyle = {},
      headerHeight
    } = this.props;

    let { columns, showHeader, columnsLeafs } = this.state;

    let styles = Object.assign(headStyle, {
      height: headerHeight
    });

    let TableComponents = components || {};

    let OutterComponent = TableComponents.head;

    if (!showHeader) {
      return null;
    }

    let innerElement = (
      <TableHead
        columns={columns}
        columnsLeafs={columnsLeafs}
        maxDepth={columnsDepth}
        onColumnResizeStop={onColumnResizeStop}
      />
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-head-container",
        children: innerElement,
        style: styles,
        ref: headRef
      };

      return <OutterComponent {...componentProps} />;
    }

    return (
      <div
        className="tablex-table-head-container"
        style={headStyle}
        ref={headRef}
      >
        {innerElement}
      </div>
    );
  }

  getPlaceholders() {
    let { frozenRender = {} } = this.props;

    let {
      top: frozenTopData = [],
      bottom: frozenBottomData = [],
      rowHeight: frozenRowHeight = 40
    } = frozenRender;

    let placeholders = {
      top: 0,
      bottom: 0
    };

    let placeholderRowHeight = frozenRowHeight;

    if (frozenTopData.length > 0) {
      placeholders.top = frozenTopData.length * placeholderRowHeight;
    }

    if (frozenBottomData.length > 0) {
      placeholders.bottom = frozenBottomData.length * placeholderRowHeight;
    }

    return placeholders;
  }

  renderBody() {
    let {
      style,
      onScroll,
      outerRef,
      containerHeight,
      headerHeight,
      rowClassName,
      onRow,
      components,
      rowRender,
      cellRenderExtra,
      rowHeight,
      frozenRender = {}
    } = this.props;

    let height = containerHeight - headerHeight - 2;

    let { columnsLeafs, data, rowKey } = this.state;

    let TableComponents = components || {};

    let OutterComponent = TableComponents.body;

    let placeholders = this.getPlaceholders();

    let styles = Object.assign({}, style);

    // styles.paddingTop = placeholders.top;
    // styles.paddingBottom = placeholders.bottom;

    let innerElement = (
      <DataList
        data={data}
        columns={columnsLeafs}
        placeholders={placeholders}
        rowKey={rowKey}
        height={height}
        rowHeight={rowHeight}
        style={styles}
        listRef={this.listRef}
        onScroll={onScroll}
        outerRef={outerRef}
        rowComponent={TableComponents.row}
        rowClassName={rowClassName}
        onRow={onRow}
        rowRender={rowRender}
        cellRenderExtra={cellRenderExtra}
      />
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-body",
        children: innerElement
      };

      return <OutterComponent {...componentProps} />;
    }

    let topList = this.renderFrozenList(frozenRender.top, "top", frozenRender);
    let bottomList = this.renderFrozenList(
      frozenRender.bottom,
      "bottom",
      frozenRender
    );

    return (
      <div className="tablex-table-body" style={{ position: "relative" }}>
        {innerElement}
        {topList}
        {bottomList}
      </div>
    );
  }

  renderFrozenList(
    data = [],
    position,
    { height, rowHeight, rowRender, cellRender, onRow, onCell, rowKey }
  ) {
    if (data.length === 0) {
      return null;
    }

    let { scrollbarX = 0, scrollbarY = 0 } = this.props;

    let { columnsLeafs } = this.state;

    let styles = {
      height: height,
      borderTop: "1px solid #eeeeee",
      position: "absolute",
      left: 0,
      backgroundColor: "#fff",
      right: scrollbarY
    };

    let currRef = null;

    if (position === "top") {
      currRef = this.extraTopRef;
      styles.top = -1;
    } else {
      styles.bottom = scrollbarX === 0 ? -1 : scrollbarX;
      currRef = this.extraBottomRef;
    }

    return (
      <div className="tablex-table-body-rows-frozen" style={styles}>
        <FrozenList
          style={{ overflow: "hidden" }}
          ref={currRef}
          data={data}
          position={position}
          columns={columnsLeafs}
          rowKey={rowKey}
          rowHeight={rowHeight}
          rowRender={rowRender}
          cellRender={cellRender}
          onRow={onRow}
          onCell={onCell}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="tablex-table">
        {this.renderHead()}
        {this.renderBody()}
      </div>
    );
  }
}

export default Table;
