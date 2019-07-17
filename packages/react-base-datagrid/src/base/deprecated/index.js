import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import TableBody from "./TableBody";

import TableHead from "./TableHead";
import "./styles.css";
import {
  getScrollbarWidth,
  formatColumns,
  addClass,
  removeClass,
  delegate
} from "./utils";
import cloneDeep from "lodash/cloneDeep";
import AutoSizer from "react-virtualized-auto-sizer";

import { SortableContainer, SortableElement } from "react-sortable-hoc";

const DraggableRow = SortableElement(({ children, rowProps }) => (
  <div {...rowProps}>{children}</div>
));

const DraggableGroup = SortableElement(({ children }) => (<>{ children }</>));

const DraggableRowGroup = SortableContainer(props => {
  let { rowData, rowIndex, children } = props;

  return (
    <DraggableRow
      {...props}
      index={rowIndex}
      collection={rowData.__depth}
      data-key={rowData.id}
    />
  );
});

function DraggableTableRow(props) {
  let { rowData, rowIndex, children, rowProps } = props;

  let hasChildren = rowData.children instanceof Array;

//   if (hasChildren) {
//     return (
//       //         <div  {...rowProps}>
//       // a
//       //         </div>

//       <DraggableGroup   index={rowIndex}
//       collection={rowData.__depth}>
//         <DraggableRowGroup
//           {...props}
//           index={rowIndex}
//           distance={10}
//           collection={rowData.__depth}
//           data-key={rowData.id}
//         />
//       </DraggableGroup>
//     );
//   }

  return (
    <DraggableRow
      {...props}
      index={rowIndex}
      data-key={rowData.id}
    >
      {children}
    </DraggableRow>
  );
}

const DraggableTable = SortableContainer(props => {
  return <TableBody {...props} rowRenderer={DraggableTableRow} />;
});

const SCROLLBARSIZE = getScrollbarWidth();

class FixedTable extends React.Component {
  headRef = React.createRef();
  leftRef = React.createRef();
  rightRef = React.createRef();
  middleRef = React.createRef();
  containerRef = React.createRef();
  headInstance = null;

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      columns: [],
      rowHeight: 40,
      rowKey: ""
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, rowKey, rowHeight } = nextProps;

      let nextState = {
        rowKey,
        data,
        columns: columns,
        rowHeight,
        prevProps: nextProps
      };
      return nextState;
    }
  }

  onLeftScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
    }
  };

  onRightScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  onMiddleScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    //true: api called  false: user interaction
    if (scrollUpdateWasRequested === false) {
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  headerScrollTo = e => {
    //this.headRef.current.scrollLeft = e.target.scrollLeft;
  };

  outterInit = ins => {
    if (this.headInstance === null) {
      this.headInstance = ins;
      ins.addEventListener("scroll", this.headerScrollTo);
    }
  };

  changeRowHoverClass = (e, target) => {
    let hoverCls = "tablex-table-row--hovered";

    let containerEl = this.containerRef.current;

    let rowIndex = -1;

    if (target) {
      rowIndex = target.dataset.rowindex;
    }

    let rows = [];

    rows = containerEl.getElementsByClassName("tablex-table-row-" + rowIndex);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (e.type === "mouseout") {
        removeClass(r, hoverCls);
      } else if (e.type === "mouseover") {
        addClass(r, hoverCls);
      }
    }
  };

  bindHoverClass = () => {
    let containerEl = this.containerRef.current;

    if (containerEl) {
      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseenter",
        this.changeRowHoverClass
      );

      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseleave",
        this.changeRowHoverClass
      );
    }
  };

  componentDidMount() {
    this.bindHoverClass();
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    let containerEl = this.containerRef.current;
    let rows = [];
    rows = containerEl.getElementsByClassName("tablex-table-row-" + oldIndex);

    for (let i = 0; i < rows.length; i++) {
      rows[i].style.visibility = "visible";
      rows[i].style.opacity = "1";
    }
  };

  getContainer = () => {
    let el = document.getElementsByClassName("tablex-main-scroll")[0]
      .firstChild;
    console.log("getContainer:", el);
    return el;
  };

  render() {
    let { width, height, onRow, rowClassName, rowRenderer } = this.props;

    let { columns, data, rowHeight, rowKey } = this.state;

    let {
      middle,
      middleWidth,
      left,
      leftWidth,
      right,
      rightWidth,
      maxDepth
    } = formatColumns(cloneDeep(columns));

    //formatColumns(cloneDeep(columns));

    let rowsHeight = height - (maxDepth + 1) * 40 - 3;

    let scrollbar_x_size = SCROLLBARSIZE;
    let scrollbar_y_size = SCROLLBARSIZE;

    if (data.length * rowHeight <= rowsHeight) {
      scrollbar_y_size = 0;
    }

    if (leftWidth + rightWidth + middleWidth <= width) {
      scrollbar_x_size = 0;
    }

    let headStyle = {
      marginRight: scrollbar_y_size
    };

    let bodyStyles = { height: "100%" };

    let hasRight = right.length > 0;

    if (hasRight === true) {
      bodyStyles.width = `calc(100% + ${scrollbar_y_size}px)`;
    }

    let attrs = {
      rowHeight,
      rowKey,
      columnsDepth: maxDepth,
      data,
      onRow,
      rowClassName,
      rowRenderer
    };

    return (
      <div
        className="tablex-container"
        style={{ width, height }}
        ref={this.containerRef}
      >
        <TableHead columns={columns} />

        <DraggableTable
          onSortEnd={this.onSortEnd}
          columns={columns}
          data={data}
          rowHeight={rowHeight}
          rowKey={rowKey}
          height={height}
          distance={10}
        />
      </div>
    );
  }
}

const AutoSizerTable = forwardRef((props, ref) => {
  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <FixedTable {...props} height={height} width={width} ref={ref} />
        );
      }}
    </AutoSizer>
  );
});

AutoSizerTable.defaultProps = {
  columns: [],
  data: [],
  rowHeight: 40,
  rowKey: "key"
};

AutoSizerTable.propTypes = {
  rowHeight: PropTypes.number,
  /**
   * 表格列
   *
   */
  columns: PropTypes.array.isRequired,
  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,
  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired
};

export default AutoSizerTable;
