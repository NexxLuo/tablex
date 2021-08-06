import React from "react";
import TableHead from "./Head";
import "./styles.css";
import { getFlattenColumns } from "./utils";
import DataList from "./DataList";
import FrozenList from "./FrozenList";

class Table extends React.Component {
  listRef = React.createRef();
  extraTopRef = React.createRef();
  extraBottomRef = React.createRef();
  containerRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      rawColumns: [],
      columns: [],
      columnsLeafs: [],
      rowKey: "",
      showHeader: true,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, rowKey, showHeader } = nextProps;

      let { roots: columnsRoots, leafs: columnsLeafs } = getFlattenColumns(
        columns
      );

      let nextState = {
        rowKey,
        data,
        rawColumns: columns,
        columns: columnsRoots,
        columnsLeafs: columnsLeafs,
        showHeader,
      };
      return nextState;
    }
  }

  scrollTo = (scrollOffsetY) => {
    this.listRef.current && this.listRef.current.scrollTo(scrollOffsetY);
  };

  scrollToItem = (index, align) => {
    this.listRef.current && this.listRef.current.scrollToItem(index, align);
  };

  //align : auto、smart、center、end、start
  scrollToRow = (key, align) => {
    let { data, rowKey } = this.state;
    let index = data.findIndex((d) => d[rowKey] === key);

    if (index > -1) {
      this.listRef.current && this.listRef.current.scrollToItem(index, align);
    }
  };

  resetAfterIndex(index, shouldForceUpdate) {
    this.listRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  extraScrollTo = (scrollOffset) => {
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
      headStyle,
      headerHeight,
      headerRowHeight,
    } = this.props;

    let { columns, showHeader, columnsLeafs } = this.state;

    let styles = Object.assign(
      { ...headStyle },
      {
        height: headerHeight,
      }
    );

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
        headerRowHeight={headerRowHeight}
        containerRef={this.containerRef}
      />
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-head-container",
        children: innerElement,
        style: styles,
        ref: headRef,
      };

      return <OutterComponent {...componentProps} />;
    }

    return (
      <div className="tablex-table-head-container" style={styles} ref={headRef}>
        {innerElement}
      </div>
    );
  }

  getPlaceholders() {
    let { frozenRender = {} } = this.props;

    let {
      top: frozenTopData = [],
      bottom: frozenBottomData = [],
      rowHeight: frozenRowHeight = 40,
    } = frozenRender;

    let placeholders = {
      top: 0,
      bottom: 0,
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
      containerHeight,
      headerHeight,
      components,
      frozenRender = {},
    } = this.props;

    let props = this.props;

    let height = containerHeight - headerHeight - 2;

    let { columnsLeafs, data, rowKey } = this.state;

    let TableComponents = components || {};

    let OutterComponent = TableComponents.body;

    let placeholders = this.getPlaceholders();

    let innerElement = (
      <DataList
        {...props}
        data={data}
        columns={columnsLeafs}
        rowKey={rowKey}
        placeholders={placeholders}
        height={height}
        listRef={this.listRef}
        rowComponent={TableComponents.row}
      />
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-body",
        children: innerElement,
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
      <div
        className="tablex-table-body"
        style={{ position: "relative" }}
        ref={this.containerRef}
      >
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
      right: scrollbarY,
    };

    let currRef = null;

    if (position === "top") {
      currRef = this.extraTopRef;
      styles.top = -1;
    } else {
      if (typeof scrollbarX === "number") {
        styles.bottom = scrollbarX === 0 ? -1 : scrollbarX;
      } else {
        styles.bottom = 0;
      }
      currRef = this.extraBottomRef;
    }

    return (
      <div className="tablex-table-rows-frozen" style={styles}>
        <FrozenList
          style={{ overflow: "hidden" }}
          ref={currRef}
          data={data}
          position={position}
          columns={columnsLeafs}
          rowKey={rowKey}
          rowHeight={rowHeight + 1}
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
