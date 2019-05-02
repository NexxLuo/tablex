import React from "react";
import PropTypes from "prop-types";
import TableBody from "./body";
import {
    treeToList
  } from "../helper";

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

   
    leftColumnLeafs.forEach(d=>{
        leftWidth = leftWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    })

    middleColumnLeafs.forEach(d=>{
        middleWidth = middleWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    })

    rightColumnLeafs.forEach(d=>{
        rightWidth = rightWidth + (d.width || DEFAULT_COLUMN_WIDTH);
    })

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

  onMiddleScroll=({scrollLeft,scrollTop})=>{
     this.refs.leftTable.scrollTo({ scrollLeft: 0, scrollTop });
     this.refs.rightTable.scrollTo({ scrollLeft: 0, scrollTop });


    if (typeof this.props.onScroll==="function") {
      this.props.onScroll({scrollLeft,scrollTop});
    }

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

    return (
      <>
        <div className="tablex-body-left" style={{width:leftColumnsWidth}}>
          <TableBody {...attrs} columns={leftColumns} columnLeafs={leftColumnLeafs} style={{ overflow: "hidden" }} ref="leftTable" />
        </div>
        <div className="tablex-body-middle" >
          <TableBody {...attrs}  columns={middleColumns}  columnLeafs={middleColumnLeafs}  onScroll={this.onMiddleScroll}  ref="middleTable" />
        </div>
        <div className="tablex-body-right"  style={{width:rightColumnsWidth}} >
          <TableBody {...attrs}  columns={rightColumns}  columnLeafs={rightColumnLeafs} style={{ overflow: "hidden" }}  ref="rightTable" />
        </div>
      </>
    );
  }
}

export default TableBodyWithFixed;
