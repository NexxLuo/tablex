import React from "react";
import Resizer from "./ColumnResizer";
import { getColumnWidthStyle, hasFlexibleColumn } from "./utils";

const Column = ({
  children,
  alignStyles,
  width,
  minWidth,
  height,
  onColumnResizeStop,
  columnKey,
  resizable
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  let styles = { ...widthStyles, height };

  return (
    <div className="tablex-table-head-cell" style={styles}>
      <div className="tablex-table-head-cell-inner" style={alignStyles}>
        {children}
      </div>
      {resizable === false ? null : (
        <Resizer
          width={width}
          columnKey={columnKey}
          onResizeStop={onColumnResizeStop}
        />
      )}
    </div>
  );
};

const ColumnGroup = ({ title, children, flexible, alignStyles }) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  return (
    <div className="tablex-table-head-group" style={styles}>
      <div className="tablex-table-head-group-cell" style={alignStyles}>
        <div className="tablex-table-head-group-inner">{title}</div>
      </div>
      <div className="tablex-table-head-group-children" style={styles}>
        {children}
      </div>
    </div>
  );
};

const renderColumns = ({
  columns,
  columnDepth,
  onColumnResizeStop,
  columnsLeafs
}) => {
  let headerHeight = 40;

  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let alignStyles = {};

    if (d.halign) {
      alignStyles.textAlign = d.halign;
    } else if (d.align) {
      alignStyles.textAlign = d.align;
    }

    let TitleComponent = d.title;
    let titleRenderFn = d.titleRender;

    if (typeof titleRenderFn === "function") {
      TitleComponent = titleRenderFn;
    }

    let titleElement = null;

    if (typeof TitleComponent === "function") {
      titleElement = <TitleComponent column={d} />;
    } else {
      titleElement = d.title;
    }

    if (d.children instanceof Array && d.children.length > 0) {
      let style = Object.assign({ height: headerHeight }, {});
      let flexible = hasFlexibleColumn(d.children);

      return (
        <ColumnGroup
          key={columnKey}
          title={titleElement}
          style={style}
          flexible={flexible}
          alignStyles={alignStyles}
        >
          {renderColumns({
            columns: d.children,
            columnDepth,
            onColumnResizeStop,
            columnsLeafs
          })}
        </ColumnGroup>
      );
    }

    let depth = d.__depth || 0;

    let h = (columnDepth - depth + 1) * headerHeight;

    let renderFn = d.headCellRender;

    if (typeof renderFn === "function") {
      titleElement = renderFn({ column: d, title: titleElement });
    }

    return (
      <Column
        key={columnKey}
        columnKey={columnKey}
        width={d.width}
        minWidth={d.minWidth}
        height={h}
        resizable={d.resizable}
        alignStyles={alignStyles}
        onColumnResizeStop={onColumnResizeStop}
      >
        {titleElement}
      </Column>
    );
  });
};

class TableHead extends React.Component {
  state = {
    columns: []
  };

  render() {
    let { columns, maxDepth, onColumnResizeStop, columnsLeafs } = this.props;

    return (
      <>
        {renderColumns({ columns, maxDepth, onColumnResizeStop, columnsLeafs })}
      </>
    );
  }
}

export default TableHead;
