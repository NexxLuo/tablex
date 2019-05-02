import React from "react";
import ReactDOM from "react-dom";
import { FixedSizeGrid as Grid } from "react-window";

import "./styles.css";

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

const Example = () => {
  const staticGrid = React.useRef(null);
  const onScroll = React.useCallback(
    ({ scrollTop, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested) {
        staticGrid.current.scrollTo({ scrollLeft: 0, scrollTop });
      }
    }
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row"
      }}
    >
      <Grid
        ref={staticGrid}
        style={{ overflowY: "hidden" }}
        className="Grid"
        columnCount={2}
        columnWidth={100}
        height={150}
        rowCount={1000}
        rowHeight={35}
        width={200}
      >
        {Cell}
      </Grid>
      <Grid
        onScroll={onScroll}
        className="Grid"
        columnCount={1000}
        columnWidth={100}
        height={150}
        rowCount={1000}
        rowHeight={35}
        width={300}
      >
        {Cell}
      </Grid>
    </div>
  );
};


export default Example;

