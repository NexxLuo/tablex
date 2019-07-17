import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import Table from "./DataList";
import TableHead from "./TableHead";
import "./styles.css";
import {
  getScrollbarWidth,
  formatColumns,
  addClass,
  removeClass,
  delegate
} from "./utils";
import cloneDeep from "lodash/cloneDeep";
import AutoSizer from "react-virtualized-auto-sizer";

const SCROLLBARSIZE = getScrollbarWidth();

class FixedTable extends React.Component {
  headRef = React.createRef();
  leftRef = React.createRef();
  rightRef = React.createRef();
  middleRef = React.createRef();
  containerRef = React.createRef();
  headInstance = null;

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      columns: [],
      rowHeight: 40,
      rowKey: ""
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, rowKey, rowHeight } = nextProps;

      let nextState = {
        rowKey,
        data,
        columns: columns,
        rowHeight,
        prevProps: nextProps
      };
      return nextState;
    }
  }

  onLeftScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
    }
  };

  onRightScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  onMiddleScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    //true: api called  false: user interaction
    if (scrollUpdateWasRequested === false) {
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  headerScrollTo = e => {
    //this.headRef.current.scrollLeft = e.target.scrollLeft;
  };

  outterInit = ins => {
    if (this.headInstance === null) {
      this.headInstance = ins;
      ins.addEventListener("scroll", this.headerScrollTo);
    }
  };

  changeRowHoverClass = (e, target) => {
    let hoverCls = "tablex-table-row--hovered";

    let containerEl = this.containerRef.current;

    let rowIndex = -1;

    if (target) {
      rowIndex = target.dataset.rowindex;
    }

    let rows = [];

    rows = containerEl.getElementsByClassName("tablex-table-row-" + rowIndex);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (e.type === "mouseout") {
        removeClass(r, hoverCls);
      } else if (e.type === "mouseover") {
        addClass(r, hoverCls);
      }
    }
  };

  bindHoverClass = () => {
    let containerEl = this.containerRef.current;

    if (containerEl) {
      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseenter",
        this.changeRowHoverClass
      );

      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseleave",
        this.changeRowHoverClass
      );
    }
  };

  componentDidMount() {
    this.bindHoverClass();
  }

  render() {
    let { width, height, onRow, rowClassName, rowRenderer } = this.props;

    let { columns, data, rowHeight, rowKey } = this.state;

    let {
      middle,
      middleWidth,
      left,
      leftWidth,
      right,
      rightWidth,
      maxDepth
    } = formatColumns(cloneDeep(columns));
 

    let rowsHeight = height - (maxDepth + 1) * 40 - 3;

    let scrollbar_x_size = SCROLLBARSIZE;
    let scrollbar_y_size = SCROLLBARSIZE;

    if (data.length * rowHeight <= rowsHeight) {
      scrollbar_y_size = 0;
    }

    if (leftWidth + rightWidth + middleWidth <= width) {
      scrollbar_x_size = 0;
    }

    let headStyle = {
      marginRight: scrollbar_y_size
    };

    let bodyStyles = { height: "100%" };

    let hasRight = right.length > 0;

    if (hasRight === true) {
      bodyStyles.width = `calc(100% + ${scrollbar_y_size}px)`;
    }

    let attrs = {
      rowHeight,
      rowKey,
      columnsDepth: maxDepth,
      data,
      onRow,
      rowClassName,
      rowRenderer
    };

    return (
      <div className="tablex-table-body">
        <div
          className="tablex-forzen-left"
          style={{
            width: leftWidth,
            overflow: "hidden"
          }}
        >
          <div
            className="tablex-body-scroll"
            style={{
              width: leftWidth,
              height: "100%",
              width: `calc(100% + ${scrollbar_y_size}px)`
            }}
          >
            <Table
              {...attrs}
              height={rowsHeight - scrollbar_x_size}
              columns={left}
              style={{ overflowX: "hidden" }}
              listRef={this.leftRef}
              onScroll={this.onLeftScroll}
              headStyle={headStyle}
            />
          </div>
        </div>
        <div
          className="tablex-main"
          ref="middleRef"
          style={{ overflow: "hidden" }}
        >
          <div className="tablex-main-scroll" style={bodyStyles}>
            <Table
              {...attrs}
              height={rowsHeight}
              columns={middle}
              listRef={this.middleRef}
              onScroll={this.onMiddleScroll}
              outerRef={this.outterInit}
              headRef={this.headRef}
              headStyle={headStyle}
            />
          </div>
        </div>

        {hasRight ? (
          <div
            className="tablex-forzen-right"
            style={{
              width: rightWidth,
              overflow: "hidden"
            }}
          >
            <Table
              {...attrs}
              height={rowsHeight - scrollbar_x_size}
              columns={right}
              style={{ overflowX: "hidden" }}
              onScroll={this.onRightScroll}
              listRef={this.rightRef}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

 
 
export default FixedTable;
