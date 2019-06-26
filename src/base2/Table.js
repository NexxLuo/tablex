import React from "react";
import PropTypes from "prop-types";
import List from "./List";
import { treeToFlatten as treeToList } from "./utils";

class TableBodyWithFixed extends React.Component {
  getColumns = arr => {
    let DEFAULT_COLUMN_WIDTH = 100;

    let left = [];
    let leftWidth = 0;

    let middle = [];
    let middleWidth = 0;

    let right = [];
    let rightWidth = 0;

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];

      if (d.fixed === "left") {
        left.push(d);
      } else if (d.fixed === "right") {
        right.push(d);
      } else {
        middle.push(d);
      }
    }

    let { leafs: leftColumnLeafs } = treeToList(left);
    let { leafs: middleColumnLeafs } = treeToList(middle);
    let { leafs: rightColumnLeafs } = treeToList(right);

    leftColumnLeafs.forEach(d => {
      leftWidth = leftWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    });

    middleColumnLeafs.forEach(d => {
      middleWidth = middleWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    });

    rightColumnLeafs.forEach(d => {
      rightWidth = rightWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    });

    return {
      leftColumns: left,
      leftColumnLeafs,
      leftColumnsWidth: leftWidth,
      middleColumns: middle,
      middleColumnsWidth: middleWidth,
      middleColumnLeafs,
      rightColumns: right,
      rightColumnsWidth: rightWidth,
      rightColumnLeafs
    };
  };

  scrollTop = 0;
  onMiddleScroll = ({ scrollOffset }) => {
    let scrollTop = scrollOffset;
    this.scrollTop = scrollTop;

    this.refs.leftTable && this.refs.leftTable.scrollTo({ scrollTop });
    this.refs.rightTable && this.refs.rightTable.scrollTo({ scrollTop });

    if (typeof this.props.onScroll === "function") {
      this.props.onScroll({ scrollTop });
    }
  };

  onSideScroll = ({ scrollOffset }) => {
    let scrollTop = scrollOffset;

    this.scrollTop = scrollTop;
    this.refs.middleTable && this.refs.middleTable.scrollTo({ scrollTop });
  };

  componentDidMount() {
    console.log("a:", this.refs.leftTable);
  }

  render() {
    let {
      columns,
      columnLeafs,
      onScroll,
      rowKey,
      dataSource,
      onExpandChange,
      expandedKeys,
      loadingKeys,
      scrollbarWidth,
      data,
      height,
      width
    } = this.props;

    let {
      leftColumns,
      leftColumnsWidth,
      leftColumnLeafs,
      middleColumns,
      middleColumnsWidth,
      middleColumnLeafs,
      rightColumns,
      rightColumnsWidth,
      rightColumnLeafs
    } = this.getColumns(columns);

    let attrs = {
      rowKey,
      data: data,
      onExpandChange,
      expandedKeys,
      loadingKeys,
      scrollbarWidth,
      height,
      width
    };

    let bodyStyles = { height: "100%" };

    let hasRight = rightColumns.length > 0;

    if (hasRight === true) {
      bodyStyles.width = "calc(100% + 6px)";
    }

    return (
      <div className="tablex-body" style={{ height: height, width: width }}>
        <div
          className="tablex-body-left"
          style={{
            width: leftColumnsWidth,
            marginBottom: scrollbarWidth,
            overflow: "hidden"
          }}
        >
          <div
            className="tablex-body-scroll"
            style={{
              width: leftColumnsWidth,
              height: "100%",
              width: "calc(100% + 6px)"
            }}
          >
            <List
              {...attrs}
              columns={leftColumns}
              columnLeafs={leftColumnLeafs}
              style={{ overflowX: "hidden" }}
              onScroll={this.onSideScroll}
              ref="leftTable"
            />
          </div>
        </div>
        <div className="tablex-body-middle" ref="middleRef">
          <div className="tablex-body-scroll" style={bodyStyles}>
            <List
              {...attrs}
              columns={middleColumns}
              columnLeafs={middleColumnLeafs}
              ref="middleTable"
              outerRef={element => {
                element &&
                  element.addEventListener("scroll", function() {
                    console.log("onscroll");
                  });
              }}
              onScroll={this.onMiddleScroll}
            />
          </div>
        </div>

        {hasRight ? (
          <div
            className="tablex-body-right"
            style={{ width: rightColumnsWidth, marginBottom: scrollbarWidth }}
          >
            <List
              {...attrs}
              columns={rightColumns}
              columnLeafs={rightColumnLeafs}
              style={{ overflowX: "hidden" }}
              onScroll={this.onSideScroll}
              ref="rightTable"
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default TableBodyWithFixed;
