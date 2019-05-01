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

  onScroll=()=>{

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
    
      onScroll:this.onScroll,
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
          <TableBody {...attrs} columns={leftColumns} columnLeafs={leftColumnLeafs}  />
        </div>
        <div className="tablex-body-middle" style={{marginLeft:leftColumnsWidth,marginRight:rightColumnsWidth}} >
          <TableBody {...attrs}  columns={middleColumns}  columnLeafs={middleColumnLeafs} />
        </div>
        <div className="tablex-body-right"  style={{width:rightColumnsWidth}} >
          <TableBody {...attrs}  columns={rightColumns}  columnLeafs={rightColumnLeafs} />
        </div>
      </>
    );
  }
}

export default TableBodyWithFixed;
