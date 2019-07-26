import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import Table from "./Table";
import "./styles.css";
import { formatColumns, addClass, removeClass, delegate } from "./utils";
import ReactResizeDetector from "react-resize-detector";

class BaseDataGrid extends React.Component {
  headRef = React.createRef();
  leftRef = React.createRef();
  rightRef = React.createRef();
  middleRef = React.createRef();
  containerRef = React.createRef();
  headInstance = null;
  scrollerIns = null;

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      formattedColumns: {},
      rowKey: "",
      hoverable: true,
      scrollbarX: 0,
      scrollbarY: 0,
      needResetScrollbar: false
    };

    if (typeof props.innerRef === "function") {
      props.innerRef(this);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, prependColumns, rowKey, hoverable } = nextProps;

      let formattedColumns = formatColumns(columns, prependColumns);

      let nextState = {
        rowKey,
        data,
        formattedColumns,
        hoverable,
        prevProps: nextProps
      };

      if (data.length !== prevState.data.length) {
        nextState.needResetScrollbar = true;
      }
      return nextState;
    }
    return null;
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

  setFrozenStyle = () => {
    let headEl = this.headRef.current;

    if (!headEl) {
      return;
    }

    let scrollLeft = headEl.scrollLeft;

    let headScrollWidth = headEl.scrollWidth;
    let headOffsetWidth = headEl.offsetWidth;

    let containerEl = this.containerRef.current;

    if (containerEl) {
      let cls = "tablex-forzen-scrolled";
      let leftEl = containerEl.getElementsByClassName("tablex-forzen-left")[0];
      let rightEl = containerEl.getElementsByClassName(
        "tablex-forzen-right"
      )[0];
      if (leftEl) {
        if (scrollLeft > 0) {
          leftEl.classList.add(cls);
        } else {
          leftEl.classList.remove(cls);
        }
      }

      if (rightEl) {
        if (scrollLeft + headOffsetWidth + 1 < headScrollWidth) {
          rightEl.classList.add(cls);
        } else {
          rightEl.classList.remove(cls);
        }
      }
    }
  };

  onDataListScroll = e => {
    let headEl = this.headRef.current;

    if (!headEl) {
      return;
    }
    let scrollLeft = e.target.scrollLeft;
    this.headRef.current.scrollLeft = scrollLeft;

    this.setFrozenStyle();
  };

  resetScrollbarSize = () => {
    let ins = this.scrollerIns;

    if (ins) {
      let { scrollbarX, scrollbarY } = this.state;
      let X = ins.offsetHeight - ins.clientHeight;
      let Y = ins.offsetWidth - ins.clientWidth;

      if (scrollbarX !== X || scrollbarY !== Y) {
        this.setState({
          scrollbarX: X,
          scrollbarY: Y,
          needResetScrollbar: false
        });
      }
    }
  };

  outterInit = ins => {
    this.scrollerIns = ins;
    this.resetScrollbarSize();
    if (this.headInstance === null) {
      this.headInstance = ins;
      if (this.props.showHeader !== false) {
        ins.addEventListener("scroll", this.onDataListScroll);
      }
    }

    if (typeof this.props.scrollRef === "function") {
      this.props.scrollRef(ins);
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
    if (this.state.hoverable) {
      this.bindHoverClass();
    }
    this.setFrozenStyle();
  }

  componentDidUpdate() {
    if (this.state.needResetScrollbar === true) {
      this.resetScrollbarSize();
    }
  }

  resetAfterIndex(index, shouldForceUpdate) {
    this.middleRef.current &&
      this.middleRef.current.resetAfterIndex(index, shouldForceUpdate);
    this.leftRef.current &&
      this.leftRef.current.resetAfterIndex(index, shouldForceUpdate);
    this.rightRef.current &&
      this.rightRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  scrollToItem(index, align) {
    this.middleRef.current && this.middleRef.current.scrollToItem(index, align);
  }

  rowRender = params => {
    let fn = this.props.rowRender;

    if (typeof fn === "function") {
      return fn(params);
    }
  };

  render() {
    let {
      width,
      height,
      onRow,
      rowClassName,
      className,
      onColumnResizeStop,
      overlayRenderer,
      emptyRenderer,
      components,
      showHeader,
      bordered,
      cellRenderExtra,
      rowHeight
    } = this.props;

    let { data, rowKey, scrollbarX, scrollbarY, formattedColumns } = this.state;

    if (scrollbarY) {
      scrollbarY = scrollbarY + 1;
    }

    let {
      middle,
      left,
      leftWidth,
      right,
      rightWidth,
      maxDepth
    } = formattedColumns;

    let hasLeft = left.length > 0;
    let hasRight = right.length > 0;

    let headerHeight = (maxDepth + 1) * 40;
    if (showHeader === false) {
      headerHeight = 0;
    }

    let headStyle = {
      marginRight: scrollbarY
    };

    if (scrollbarY > 0 && !hasRight) {
      headStyle.marginRight = scrollbarY - 1;
    }

    let bodyStyles = { height: "100%" };

    let frozens = {};

    if (hasRight === true) {
      bodyStyles.width = `calc(100% + ${scrollbarY}px)`;
    }

    if (hasLeft) {
      frozens.left = leftWidth;
    }
    if (hasRight) {
      frozens.right = rightWidth;
    }

    let attrs = {
      rowHeight,
      rowKey,
      columnsDepth: maxDepth,
      data,
      onRow,
      rowClassName,
      onColumnResizeStop,
      components,
      showHeader,
      cellRenderExtra
    };

    let overlay = null;
    if (typeof overlayRenderer === "function") {
      overlay = overlayRenderer();
    }

    let emptyOverlay = null;
    if (data.length === 0 && typeof emptyRenderer === "function") {
      emptyOverlay = emptyRenderer();
    }

    let cls = ["tablex-container"];
    if (className) {
      cls.push(className);
    }

    if (bordered === true) {
      cls.push("tablex-bordered");
    }

    cls = cls.join(" ");

    return (
      <div className={cls} style={{ width, height }} ref={this.containerRef}>
        {overlay}
        {emptyOverlay}
        {hasLeft ? (
          <div
            className="tablex-forzen-left"
            style={{
              width: leftWidth,
              overflow: "hidden"
            }}
          >
            <div
              className="tablex-body-scroll"
              style={{
                width: leftWidth,
                height: "100%",
                width: `calc(100% + ${scrollbarY}px)`
              }}
            >
              <Table
                {...attrs}
                headerHeight={headerHeight}
                containerHeight={height - scrollbarX}
                columns={left}
                style={{ overflowX: "hidden" }}
                ref={this.leftRef}
                onScroll={this.onLeftScroll}
                rowRender={params =>
                  this.rowRender({
                    ...params,
                    frozen: "left",
                    frozens: frozens
                  })
                }
              />
            </div>
          </div>
        ) : null}
        <div className="tablex-main" style={{ overflow: "hidden" }}>
          <div className="tablex-main-scroll" style={bodyStyles}>
            <Table
              {...attrs}
              headerHeight={headerHeight}
              containerHeight={height}
              columns={middle}
              ref={this.middleRef}
              onScroll={this.onMiddleScroll}
              outerRef={this.outterInit}
              headRef={this.headRef}
              headStyle={headStyle}
              rowRender={params =>
                this.rowRender({
                  ...params,
                  frozen: "none",
                  frozens: frozens
                })
              }
            />
          </div>
        </div>

        {hasRight ? (
          <div
            className="tablex-forzen-right"
            style={{
              width: rightWidth,
              overflow: "hidden"
            }}
          >
            <Table
              {...attrs}
              headerHeight={headerHeight}
              containerHeight={height - scrollbarX}
              columns={right}
              style={{ overflowX: "hidden" }}
              onScroll={this.onRightScroll}
              ref={this.rightRef}
              rowRender={params =>
                this.rowRender({
                  ...params,
                  frozen: "right",
                  frozens: frozens
                })
              }
            />
          </div>
        ) : null}
      </div>
    );
  }
}

const AutoSizerTable = forwardRef((props, ref) => {
  return (
    <ReactResizeDetector handleWidth handleHeight>
      {({ width, height }) => {
        if (!height) {
          return <div />;
        }

        return (
          <BaseDataGrid {...props} height={height} width={width} ref={ref} />
        );
      }}
    </ReactResizeDetector>
  );
});

BaseDataGrid.defaultProps = {
  columns: [],
  prependColumns: [],
  data: [],
  rowHeight: 40,
  rowKey: "key",
  showHeader: true,
  hoverable: true,
  bordered: true
};

BaseDataGrid.propTypes = {
  /** 是否显示表头 */
  showHeader: PropTypes.bool,

  /** 是否显示边框 */
  bordered: PropTypes.bool,

  /** 鼠标hover样式 */
  hoverable: PropTypes.bool,

  /** 行高 */
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

  /** table最小高度，虚拟加载的表格依赖外部区域的高度，如果未探测到外部高度，将使用此高度 */
  minHeight: PropTypes.number,

  /** 自定义行样式 */
  rowClassName: PropTypes.func,

  /**
   * 表格列
   *
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      width: PropTypes.number,
      key: PropTypes.string,
      dataIndex: PropTypes.string,
      align: PropTypes.oneOf(["left", "right", "center"]),
      halign: PropTypes.oneOf(["left", "right", "center"]),
      minWidth: PropTypes.number,
      fixed: PropTypes.oneOf([false, "left", "right"]),
      resizable: PropTypes.bool,
      render: PropTypes.func,
      validator: PropTypes.func,
      editor: PropTypes.func
    })
  ),

  /** 额外前置添加的列 */
  prependColumns: PropTypes.array,

  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,
  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired,

  /**
   * 覆盖table元素，如：components:{row:func}
   */
  components: PropTypes.object,

  /** 获取数据滚动区域ref */
  scrollRef: PropTypes.func,

  /** 自定义行内渲染 */
  rowRender: PropTypes.func,

  /** 自定义行属性，可处理行事件 */
  onRow: PropTypes.func,

  /** 列宽拖动完成事件，(width, columnKey) */
  onColumnResizeStop: PropTypes.func,

  /** 获取table ref */
  innerRef: PropTypes.func,

  /** 获取 list ref */
  listRef: PropTypes.func
};

export default AutoSizerTable;
