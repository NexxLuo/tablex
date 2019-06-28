import React, { useMemo } from "react";
import { getTreeLeafs } from "./utils";

const Column = ({ cell, depth, columnDepth, headerHeight, dataIndex }) => {
  let h = (columnDepth - depth + 1) * headerHeight;

  return (
    <div className="tablex-head-column" style={{ height: h }} >
      {cell}
    </div>
  );
};

const ColumnGroup = ({ title, children, headerHeight }) => {
  return (
    <div className="tablex-head-group" style={{ display: "block" }}>
      <div
        style={{
          height: headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: "1px solid #eeeeee"
        }}
      >
        {title}
      </div>
      <div
        style={{
          height: headerHeight,
          display: "flex",
          borderTop: "1px solid #eeeeee"
        }}
      >
        {children}
      </div>
    </div>
  );
};

const isForzen = (type = "", column) => {
  let bl = false;

  let leafs = getTreeLeafs([column]);

  bl = leafs.findIndex(d => d.frozen === type) > -1;

  return bl;
};

const renderChildren = ({
  parent,
  headerHeight,
  columnDepth,
  cells,
  columnList,
  frozen
}) => {
  let columns = parent.children || [];

  if (frozen === "right" || frozen === "left") {
    columns = columns.filter(c => isForzen(frozen, c));
  } 

  if (columns.length > 0) {
    return (
      <ColumnGroup
        key={parent.key}
        title={parent.title}
        depth={parent.__depth}
        columnDepth={columnDepth}
        headerHeight={headerHeight}
      >
        {columns.map((d, i) => {
          let childrens = d.children || [];

          if (childrens.length > 0) {
            return renderChildren({
              parent: d,
              headerHeight,
              columnDepth,
              cells,
              columnList,
              frozen
            });
          } else {
            let cellIndex = columnList.findIndex(c => c.key === d.key);
            let column = columnList[cellIndex] || {};
            if (frozen !== "left" && frozen !== "right") {
              if (d.frozen === "left" || d.frozen === "right") {
                if (column.__placeholder__ !== true) {
                }

                if (d.__parents && d.__parents.length > 0) {
                }
                return null;
              }
            }

            return (
              <Column
                key={d.dataIndex || i}
                {...d}
                cell={cells[cellIndex]}
                depth={d.__depth}
                columnDepth={columnDepth}
                headerHeight={headerHeight}
              />
            );
          }
        })}
      </ColumnGroup>
    );
  }
  return null;
};

const renderColumns = ({
  columns,
  cells,
  columnList,
  columnDepth,
  headerHeight
}) => {
  let frozen = "";
  let arr = columnList.filter(d => !d.__placeholder__);
  if (arr[0]) {
    frozen = arr[0].frozen || "middle";
  }

  if (frozen === "middle") {
    //console.log("renderColumns:", cells);
  }

  return columns.map((d, i) => {
    let cellIndex = columnList.findIndex(c => c.key === d.key);

    let children = d.children || [];

    if (children.length > 0) {
      return renderChildren({
        parent: d,
        headerHeight,
        columnDepth,
        cells,
        columnList,
        frozen
      });
    } else {
      if (frozen === "middle") {
      }

      if (
        columnList[cellIndex] &&
        columnList[cellIndex].__placeholder__ === true
      ) {
        if (columnList[cellIndex].frozen === "right") {
          return null;
        }

        return cells[cellIndex];
      }

      return (
        <Column
          key={d.dataIndex || i}
          {...d}
          cell={cells[cellIndex]}
          depth={d.__depth}
          columnDepth={columnDepth}
          headerHeight={headerHeight}
        />
      );
    }
  });
};

function GroupHeader(props) {
  return <React.Fragment>{renderColumns(props)}</React.Fragment>;
}

const MemoHeader = ({
  cells = [],
  columns,
  columnList,
  columnDepth,
  headerHeight = 40
}) => {
  const memoizedValue = useMemo(() => {
    return (
      <GroupHeader
        cells={cells}
        columns={columns}
        columnList={columnList}
        columnDepth={columnDepth}
        headerHeight={headerHeight}
      />
    );
  }, [cells]);

  return memoizedValue;
};

export default MemoHeader;
