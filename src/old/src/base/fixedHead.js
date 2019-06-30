import React from "react";
import PropTypes from "prop-types";
import TableHead from "./head";
import { treeToList } from "../helper";

class TableHeadWithFixed extends React.Component {
  headRef = React.createRef();

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
      leftColumns: left.concat(middle, right),
      leftColumnLeafs: leftColumnLeafs.concat(
        middleColumnLeafs,
        rightColumnLeafs
      ),
      leftColumnsWidth: leftWidth,
      middleColumns: middle.concat(left, right),
      middleColumnsWidth: middleWidth,
      middleColumnLeafs: middleColumnLeafs.concat(
        leftColumnLeafs,
        rightColumnLeafs
      ),
      rightColumns: right.concat(left, middle),
      rightColumnsWidth: rightWidth,
      rightColumnLeafs: rightColumnLeafs.concat(
        leftColumnLeafs,
        middleColumnLeafs
      )
    };
  };

  onMiddleScroll = ({ scrollLeft, scrollTop }) => {
    this.refs.leftTable.scrollTo({ scrollLeft: 0, scrollTop });

    if (typeof this.props.onScroll === "function") {
      this.props.onScroll({ scrollLeft, scrollTop });
    }
  };

  componentDidMount() {
    if (typeof this.props.initRef === "function") {
      this.props.initRef(this);
    }
  }

  scrollTo = ({scrollLeft}) => {
 
    this.headRef.current.scrollTo(scrollLeft,0);
  };

  render() {
    let { columns, scrollbarWidth } = this.props;

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

    return (
      <>
        <div className="tablex-head-left" style={{ width: leftColumnsWidth }}>
          <TableHead columns={leftColumns} columnLeafs={leftColumnLeafs} />
        </div>
        <div
          className="tablex-head-middle"
        
          ref={this.headRef}
        >
          <TableHead
            columns={middleColumns}
            columnLeafs={middleColumnLeafs}
           
          />
        </div>
        <div className="tablex-head-right" style={{ width: rightColumnsWidth }}>
          <TableHead columns={rightColumns} columnLeafs={rightColumnLeafs} />
        </div>
      </>
    );
  }
}

export default TableHeadWithFixed;
