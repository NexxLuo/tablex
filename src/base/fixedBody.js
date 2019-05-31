import React from "react";
import PropTypes from "prop-types";
import TableBody from "./body";
import { treeToList } from "../helper";

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
  onMiddleScroll = ({ scrollLeft, scrollTop }) => {
    this.scrollTop = scrollTop;


    this.refs.leftTable.scrollTo({ scrollLeft: 0, scrollTop });
    this.refs.rightTable &&
      this.refs.rightTable.scrollTo({ scrollLeft: 0, scrollTop });

    if (typeof this.props.onScroll === "function") {
      this.props.onScroll({ scrollLeft, scrollTop });
    }
  };

  onSideScroll = ({ scrollLeft, scrollTop }) => {
    this.scrollTop = scrollTop;

    this.refs.middleTable.scrollTo({ scrollTop });
  };

  componentDidMount() {}

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
      scrollbarWidth
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
      dataSource,
      onExpandChange,
      expandedKeys,
      loadingKeys,
      scrollbarWidth
    };

    let bodyStyles = {};

    let hasRight = rightColumns.length > 0;

    if (hasRight === true) {
      bodyStyles = {

      };
    }

    let totalHeight = dataSource.length * 35;

    return (
      <>
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
            style={{ width: leftColumnsWidth, height: "100%",width:"calc(100% + 6px)"  }}
          >
            <TableBody
              {...attrs}
              columns={leftColumns}
              columnLeafs={leftColumnLeafs}
              style={{ overflowX: "hidden" }}
              ref="leftTable"
              onScroll={this.onSideScroll}
            />
          </div>
        </div>
        <div className="tablex-body-middle" ref="middleRef">
        <div
            className="tablex-body-scroll"
            style={{  height: "100%",width:"calc(100% + 6px)" }}
          >
          <TableBody
            {...attrs}
            columns={middleColumns}
            style={bodyStyles}
            columnLeafs={middleColumnLeafs}
            onScroll={this.onMiddleScroll}
            ref="middleTable"
          /></div>
        </div>

        {hasRight ? (
          <div
            className="tablex-body-right"
            style={{ width: rightColumnsWidth, marginBottom: scrollbarWidth }}
          >
         <TableBody
              {...attrs}
              columns={rightColumns}
              columnLeafs={rightColumnLeafs}
              style={{ overflowX: "hidden" }}
              onScroll={this.onSideScroll}
              ref="rightTable"
            />
          </div>
        ) : null}
      </>
    );
  }
}

export default TableBodyWithFixed;
