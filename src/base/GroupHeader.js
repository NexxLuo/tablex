import React, { useMemo } from "react";
import { getTreeLeafs } from "./utils";

const Column = ({ cell, depth, columnDepth, headerHeight }) => {
  let h = (columnDepth - depth + 1) * headerHeight;
  return (
    <div className="table-head-group-children" style={{ height: h }}>
      {cell}
    </div>
  );
};

const ColumnGroup = ({ title, children, headerHeight }) => {
  return (
    <div className="GroupCell" style={{ display: "block" }}>
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

const renderColumns = ({
  columns,
  cells,
  columnList,
  columnDepth,
  headerHeight
}) => {
  return columns.map((d, i) => {
    let columnIndex = columnList.findIndex(c => c.key === d.key);
    let cell = cells[columnIndex];

    let arr = columnList.filter(d => !d.__placeholder__);

    let frozen = "";
    arr[0] && (frozen = arr[0].frozen);

    let childrens = d.children || [];

    if (frozen === "left" || frozen === "right") {
      childrens = childrens.filter(d => !!d.frozen);
    } else {
      childrens = childrens.filter(d => !d.frozen);

      let leafs = getTreeLeafs(childrens);

      //当非冻结列下的子级别均被冻结，则不渲染分组表头
      let notFrozenColumns = leafs.filter(d => !d.frozen);
      if (childrens.length > 0 && notFrozenColumns.length === 0) {
        return null;
      }
    }

    if (childrens.length > 0) {
      return (
        <ColumnGroup
          key={d.dataIndex || i}
          {...d}
          depth={d.__depth}
          columnDepth={columnDepth}
          cell={cell}
          headerHeight={headerHeight}
        >
          {renderColumns({
            columns: childrens,
            cells,
            columnList,
            columnDepth,
            headerHeight
          })}
        </ColumnGroup>
      );
    }

    return (
      <Column
        key={d.dataIndex || i}
        {...d}
        cell={cells[columnIndex]}
        depth={d.__depth}
        columnDepth={columnDepth}
        headerHeight={headerHeight}
      />
    );
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
