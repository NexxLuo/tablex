import React from "react";
import Resizer from "./ColumnResizer";
import {
  getColumnWidthStyle,
  hasFlexibleColumn,
  isFlexibleColumn,
  treeFilter,
  getColumnsWidth,
  getColumnHeight
} from "./table-head-utils";

const HEADER_HEIGHT = 40;

const ColumnPlaceolder = ({ width, minWidth, flexible, height }) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  if (flexible) {
    widthStyles.flexGrow = 1;
    widthStyles.flexShrink = 1;
  }

  let cellStyles = { height, ...widthStyles };

  let clsArr = ["tablex-table-head-cell tablex-table-head-cell-placeholder"];

  return <div className={clsArr.join(" ")} style={cellStyles}></div>;
};

const Column = ({
  title,
  children,
  alignStyles,
  flexible,
  width,
  minWidth,
  height,
  onColumnResizeStop,
  columnKey,
  resizable,
  headerCellProps,
  className = "",
  style = {}
}) => {
  let widthStyles = getColumnWidthStyle({ width, minWidth });

  if (flexible) {
    widthStyles.flexGrow = 1;
    widthStyles.flexShrink = 1;
  }

  let cellStyles = { height, ...widthStyles };

  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  let clsArr = ["tablex-table-head-cell"];
  className && clsArr.push(className);
  if (headerCellProps && headerCellProps.className) {
    clsArr.push(headerCellProps.className);
  }

  let attr = {};

  if (typeof title === "string" || typeof title === "number") {
    attr.title = title;
  }

  return (
    <div
      {...attr}
      {...headerCellProps}
      className={clsArr.join(" ")}
      style={{ ...style, ...cellStyles }}
    >
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

const ColumnGroup = ({
  className,
  title,
  flexible,
  alignStyles,
  height,
  width,
  headerCellProps,
  style = {}
}) => {
  let styles = {};
  if (flexible) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }

  let cellStyles = { height, width: width };
  if (headerCellProps.style) {
    cellStyles = Object.assign({}, headerCellProps.style || {}, cellStyles);
  }

  let clsArr = ["tablex-table-head-group-cell"];
  className && clsArr.push(className);
  if (headerCellProps && headerCellProps.className) {
    clsArr.push(headerCellProps.className);
  }

  let attr = {};

  if (typeof title === "string" || typeof title === "number") {
    attr.title = title;
  }

  return (
    <div
      className={clsArr.join(" ")}
      style={{ ...style, ...cellStyles }}
      {...attr}
    >
      {height > 0 ? (
        <div className="tablex-table-head-group-cell-inner" style={alignStyles}>
          {title}
        </div>
      ) : null}
    </div>
  );
};

const renderColumns = ({
  rowColspan,
  columns,
  columnDepth,
  currentDepth,
  onColumnResizeStop,
  headerRowHeight
}) => {
  return columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let columnWidth = d.width;
    let columnHeight = 0;
    let columnClass = "";
    let columnStyle = {};
    let columnResizable = d.resizable;

    let columnWidthEndIndex = i + 1;

    // 处理行、列合并
    let colSpan = d.colSpan;
    let rowSpan = d.__rowspan__ || 1;

    if (typeof colSpan === "number") {
      if (colSpan === 0) {
        return null;
      } else {
        let colSpanEnd = i + colSpan - 1;
        columnWidthEndIndex = i + colSpan;
        rowColspan.start = i;
        rowColspan.end = colSpanEnd;
        columnResizable = false;
      }
    }
    columnWidth = getColumnsWidth({
      columns: columns,
      start: i,
      end: columnWidthEndIndex,
      maxDepth: columnDepth
    });

    let isInColspan = false;
    if (i > rowColspan.start && i <= rowColspan.end) {
      isInColspan = true;
    }

    if (isInColspan) {
      return null;
    }

    columnHeight = getColumnHeight({
      depth: currentDepth,
      rowspan: rowSpan,
      rowHeights: headerRowHeight
    });

    if (rowSpan > 1) {
      columnClass = "tablex-head-cell-rowcolspan";
      //层级越小的zIndex越大，上面的表头行覆盖下面的表头行
      columnStyle.zIndex = columnDepth - currentDepth + 2;
    }

    let flexible = isFlexibleColumn(d);

    //被rowSpan掉的行，需要进行占位列渲染
    if (d.__placeholder__ === true) {
      return (
        <ColumnPlaceolder
          key={columnKey}
          flexible={flexible}
          width={columnWidth}
          minWidth={d.minWidth}
          height={columnHeight}
        ></ColumnPlaceolder>
      );
    }
    //

    let alignStyles = {};

    if (d.halign) {
      alignStyles.textAlign = d.halign;
    }

    let TitleComponent = d.title;
    let titleRenderFn = d.titleRender;
    let onHeaderCell = d.onHeaderCell;

    let headerCellProps = {};
    if (typeof onHeaderCell === "function") {
      headerCellProps = onHeaderCell(d);
    }

    if (typeof titleRenderFn === "function") {
      TitleComponent = titleRenderFn;
    }

    let titleElement = null;

    if (typeof TitleComponent === "function") {
      titleElement = <TitleComponent column={d} {...headerCellProps} />;
    } else {
      titleElement = d.title;
    }

    let renderFn = d.headCellRender;

    if (typeof renderFn === "function") {
      titleElement = renderFn({ column: d, title: titleElement });
    }

    if (d.children instanceof Array && d.children.length > 0) {
      let flexible = hasFlexibleColumn(d.children);

      return (
        <ColumnGroup
          key={columnKey}
          className={columnClass}
          headerCellProps={headerCellProps}
          title={titleElement}
          flexible={flexible}
          alignStyles={alignStyles}
          width={columnWidth}
          height={columnHeight}
          style={columnStyle}
        ></ColumnGroup>
      );
    }

    return (
      <Column
        key={columnKey}
        className={columnClass}
        headerCellProps={headerCellProps}
        columnKey={columnKey}
        flexible={flexible}
        width={columnWidth}
        minWidth={d.minWidth}
        height={columnHeight}
        resizable={columnResizable}
        alignStyles={alignStyles}
        onColumnResizeStop={onColumnResizeStop}
        style={columnStyle}
        title={d.title}
      >
        {titleElement}
      </Column>
    );
  });
};

class TableHead extends React.Component {
  renderRow = () => {
    let {
      columns,
      maxDepth,
      onColumnResizeStop,
      headerRowHeight = [],
      columnsLeafs
    } = this.props;

    let rows = [];

    //计算过行合并的列数据
    let rowsColumns = {};

    for (let i = 0; i < maxDepth + 1; i++) {
      let currentRowColumns = [];

      treeFilter(columns, (d, j, extra) => {
        let c = Object.assign({}, d);
        let depth = extra.depth;

        let rowDepth = i;

        let prevRowspan = 0;
        let prevColumns = rowsColumns[i - 1] || [];

        let parent = d.__parent;
        let parentKey = "";
        if (parent) {
          parentKey = parent.key;
        }
        let prev = prevColumns.find((p, pi) => {
          let pk = p.key || p.dataIndex || pi;
          return pk === parentKey;
        });
        if (prev) {
          prevRowspan = prev.__rowspan__ || 0;
        }

        let isRowColumn = false;
        let isCurrentRow = false;
        let isPlaceholder = false;
        let hasChildren = false;
        let maxRowSpan = maxDepth - rowDepth + 1;
        let currRowSpan = 1;

        //根据列层级匹配列是否属于此行
        if (depth === i) {
          isCurrentRow = true;
        }

        //如果此列没有子级，则设置此列的rowSpan
        if (d.children && d.children.length > 0) {
          hasChildren = true;
        } else {
          currRowSpan = maxRowSpan;
        }

        //父列如果存在rowSpan且大于1，则此行此列只渲染占位符
        if (prevRowspan > 1) {
          isPlaceholder = true;
        }

        //如果配置的rowSpan大于最大可合并行数，则重置为最大值
        if (typeof d.rowSpan === "number") {
          currRowSpan = c.rowSpan;
          if (currRowSpan > maxRowSpan) {
            currRowSpan = maxRowSpan;
          }
        }

        if (isCurrentRow) {
          isRowColumn = true;
        } else {
          //非当前行的末级列，需要在当前行渲染占位列
          if (!hasChildren && depth < rowDepth) {
            isRowColumn = true;
            isPlaceholder = true;

            //处理rowSpan下还存在children时,无法显示的问题
            if (parentKey) {
              isPlaceholder = false;
            }
            //
          }
        }

        //占位列 不进行行合并
        if (isPlaceholder) {
          currRowSpan = 1;
          c.__placeholder__ = true;
        }

        if (currRowSpan > 1) {
          c.__rowspan__ = currRowSpan;
        }

        if (isRowColumn) {
          currentRowColumns.push(c);
        }

        return true;
      });

      rowsColumns[i] = currentRowColumns;
    }

    for (let i = 0; i < maxDepth + 1; i++) {
      let rowColumns = rowsColumns[i];

      let rowHeight = headerRowHeight[i] || HEADER_HEIGHT;

      let rowColspan = {};

      rows.push(
        <div
          className="tablex-head-row"
          style={{ height: rowHeight, display: "flex" }}
          key={"row-" + i}
        >
          {renderColumns({
            rowColspan: rowColspan,
            columns: rowColumns.slice(),
            columnDepth: maxDepth,
            currentDepth: i,
            onColumnResizeStop,
            columnsLeafs,
            headerRowHeight
          })}
        </div>
      );
    }

    return rows;
  };

  render() {
    let { columnsLeafs } = this.props;

    let w = 0;
    columnsLeafs.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    return (
      <div
        className="tablex-table-head"
        style={{ minWidth: w, flexDirection: "column" }}
      >
        {this.renderRow()}
      </div>
    );
  }
}

export default TableHead;
