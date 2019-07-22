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

  scrollToItem = (index, align) => {
    this.listRef.current && this.listRef.current.scrollToItem(index, align);
  };

  resetAfterIndex(index, shouldForceUpdate) {
    this.listRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  renderHead() {
    let {
      columnsDepth,
      headRef,
      onColumnResizeStop,
      components,
      headStyle = {},
      headerHeight
    } = this.props;

    let styles = Object.assign(headStyle, {
      height: headerHeight
    });

    let { columns, showHeader } = this.state;

    let TableComponents = components || {};

    let OutterComponent = TableComponents.head;

    if (!showHeader) {
      return null;
    }

    let innerElement = (
      <TableHead
        columns={columns}
        maxDepth={columnsDepth}
        onColumnResizeStop={onColumnResizeStop}
      />
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-head",
        children: innerElement,
        style: styles,
        ref: headRef
      };

      return <OutterComponent {...componentProps} />;
    }

    return (
      <div className="tablex-table-head" ref={headRef} style={headStyle}>
        {innerElement}
      </div>
    );
  }

  renderBody() {
    let {
      onScroll,
      style,
      outerRef,
      containerHeight,
      headerHeight,
      rowClassName,
      onRow,
      components,
      rowRender
    } = this.props;

    let height = containerHeight - headerHeight - 2;

    let { columnsLeafs, data, rowHeight, rowKey } = this.state;

    let TableComponents = components || {};

    let OutterComponent = TableComponents.body;

    let innerElement = (
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
    );

    if (typeof OutterComponent === "function") {
      let componentProps = {
        className: "tablex-table-body",
        children: innerElement
      };

      return <OutterComponent {...componentProps} />;
    }

    return <div className="tablex-table-body">{innerElement}</div>;
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
