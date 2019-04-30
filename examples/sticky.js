import React from "react";
import ReactDOM from "react-dom";
import { VariableSizeGrid as Grid } from "react-window";

import "./styles.css";

// These cell sizes are arbitrary.
// Yours should be based on the content of the cell.
const columnWidths = new Array(1000)
  .fill(true)
  .map((e, i) => (i === 0 ? 200 : 75 + Math.round(Math.random() * 50)));
const rowHeights = new Array(1000)
  .fill(true)
  .map((e, i) => (i === 0 ? 60 : 25 + Math.round(Math.random() * 50)));

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div
    className={
      columnIndex % 2
        ? rowIndex % 2 === 0
          ? "GridItemOdd"
          : "GridItemEven"
        : rowIndex % 2
        ? "GridItemOdd"
        : "GridItemEven"
    }
    style={style}
  >
    r{rowIndex}, c{columnIndex}
  </div>
);

const Example = () => (
  <div>
    <div
      style={{
        background: "grey",
        zIndex: 2,
        top: 8,
        left: 8,
        height: 61,
        width: 201,
        position: "fixed"
      }}
    />

    <Grid
      className="Grid"
      columnCount={1000}
      columnWidth={index => columnWidths[index]}
      height={350}
      rowCount={1000}
      rowHeight={index => rowHeights[index]}
      width={500}
    >
      {Cell}
    </Grid>
  </div>
);

ReactDOM.render(<Example />, document.getElementById("root"));
