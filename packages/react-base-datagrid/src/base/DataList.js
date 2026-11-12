import React, {
  Component,
  memo,
  useEffect,
  useRef
} from "react";
import memoize from "memoize-one";
import PaneRows from "./PaneRows";
import { RowsApiContext } from "./RowsProvider";
import { getColumnWidthStyle } from "./utils";
import ItemList from "./ItemList";
import {
  useSelector,
  EMPTY_KEYS_SIGNAL,
  EMPTY_EDIT_SIGNAL,
  EMPTY_MAP_SIGNAL
} from "../signal";

const createItemData = memoize((data, columns, rowKey) => ({
  data,
  columns,
  rowKey
}));

class CellWithTitle extends Component {
  elRef = React.createRef();

  setTitle() {
    let { value } = this.props;
    let el = this.elRef.current;

    if (el) {
      let parentEl = el.parentNode;
      if (parentEl) {
        if (parentEl.scrollWidth > parentEl.offsetWidth) {
          el.title = value;
        } else {
          el.title = "";
        }
      }
    }
  }

  componentDidMount() {
    this.setTitle();
  }

  componentDidUpdate() {
    this.setTitle();
  }

  render() {
    let { value } = this.props;
    return <span ref={this.elRef}>{value}</span>;
  }
}

/**
 * rowSpan 合并格的统一渲染形态。
 * 定位：relative 负偏移(top)回退到合并区起点——占位留在本行列位置
 * (列水平对齐天然正确)，视觉上移；行高被虚拟样式钉死，格子溢出行可见。
 * 层叠：被覆盖行整体垫底(zIndex:-1，见 ListItem)，合并格自身无需 zIndex——
 * 行有 contain:layout(独立层叠上下文)，格子级 zIndex 无法跨行生效
 * 两种触发方：
 * - 主渲染：起始行挂载，TableCell 在 render 返回中发现 rowSpan 时直接渲染(top 省略)
 * - 接管渲染：起始行滚出虚拟窗口，由窗口第一行(PaneRows 经 takeover prop 指定)
 *   渲染(top = -起始行到本行的累计高度)，单份渲染、无残留
 */
function SpanTakeoverCell({ decl, rowIndex, getRowsHeight, align, columnStyle }) {
  let height = getRowsHeight(decl.start, decl.end);
  let above = getRowsHeight(decl.start, rowIndex);

  let styles = Object.assign({}, getColumnWidthStyle(decl), {
    height: height
  });
  if (above > 0) {
    styles.top = -above;
  }
  if (decl.flexGrow === 1) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  }
  styles = Object.assign({}, styles, columnStyle);

  let alignStyles = {};
  align && (alignStyles.textAlign = align);

  if (height === 0) {
    return null;
  }

  return (
    <div
      className="tablex-table-row-cell tablex-table-row-cell-rowspan"
      style={styles}
    >
      <div className="tablex-table-row-cell-inner" style={alignStyles}>
        {decl.element}
      </div>
    </div>
  );
}

const TableCell = props => {
  let {
    row,
    rowKey,
    rowIndex,
    rowColumns,
    getRowsHeight,
    getColumnsWidth,
    columnColSpan,
    declareRowSpan,
    findRowSpanCover,
    dataIndex,
    columnKey,
    columnIndex,
    width,
    minWidth,
    align,
    prependRender,
    render,
    onCell,
    onCellContent,
    cellRenderExtra,
    columnStyle,
    extra,
    disabledRowSpan
  } = props;

  let value = row[dataIndex];

  //列被colSpan吃掉：整格跳过(依赖列从左到右的渲染顺序，游标由合并格推进)
  if (columnColSpan.end > columnIndex) {
    return null;
  }

  //行被rowSpan覆盖：渲染同宽空占位格保持列位(不执行render，无内容)，
  //该区域由起始行/接管行渲染的合并格(zIndex+白底)自上而下覆盖。
  //不能删格子：flex行布局下删格子会使后续列前移错位
  //(colSpan被吃列可以删——合并格宽度已补偿；rowSpan覆盖列没有宽度补偿)
  if (disabledRowSpan !== true && findRowSpanCover) {
    let cover = findRowSpanCover(columnKey, rowIndex);
    if (cover) {
      let styles = getColumnWidthStyle({ width, minWidth });
      //组合rowSpan+colSpan：占位格宽度覆盖被吃的列，并推进行内游标
      if (cover.colSpanEnd > columnIndex + 1) {
        let columnsStyle = getColumnsWidth(columnIndex, cover.colSpanEnd);
        styles.width = columnsStyle.width;
        if (columnsStyle.flexGrow === 1) {
          styles.flexGrow = 1;
          styles.flexShrink = 1;
        }
        columnColSpan.end = cover.colSpanEnd;
      }
      return (
        <div
          className="tablex-table-row-cell"
          style={Object.assign({}, styles, columnStyle)}
          data-columnkey={columnKey}
          data-rowindex={rowIndex}
        />
      );
    }
  }

  let prepend = null;
  let prependFn = prependRender;
  if (typeof prependFn === "function") {
    prepend = prependFn(value, row, rowIndex);
  }

  let cellExtra = {};
  if (typeof cellRenderExtra === "function") {
    cellExtra = cellRenderExtra({
      rowData: row,
      rowKey: rowKey,
      rowIndex: rowIndex,
      columnKey: columnKey,
      extra: extra
    });
  }

  let extraAttr = {};
  if (typeof onCell === "function") {
    extraAttr =
      onCell(
        row,
        rowIndex,
        Object.assign({ columnKey }, cellExtra || {}),
        extra
      ) || {};
  }

  if (typeof onCellContent === "function") {
    const _extraArr =
      onCellContent(
        {
          rowKey: rowKey,
          rowIndex: rowIndex,
          columnKey,
          dataIndex,
          rowColumns
        }
      ) || {};
    extraAttr = Object.assign(_extraArr, extraAttr);
  }

  let cellRender = render;
  let cellElement = value;

  let rowColSpanStyles = {};
  let propsStyles = {};
  let hasRowSpan = false;

  if (typeof cellRender === "function") {
    let renderValue = cellRender(value, row, rowIndex, cellExtra);
    if (!React.isValidElement(renderValue) && renderValue instanceof Object) {
      //antd 契约：render 可返回 {children, props:{rowSpan/colSpan/style}}
      let { children = null, props = {} } = renderValue;
      let { rowSpan, colSpan, style } = props;

      propsStyles = style || {};

      cellElement = children;

      //colSpan 声明信息(同时供接管格复用)
      let colSpanEnd = columnIndex + 1;
      let colSpanWidth = null;

      if (typeof rowSpan !== "undefined" && disabledRowSpan !== true) {
        if (rowSpan === 0) {
          cellElement = null;
        } else if (rowSpan > 1) {
          let rowSpanEnd = rowIndex + rowSpan;
          let h = getRowsHeight(rowIndex, rowSpanEnd);

          //声明合并区：接管渲染(起始行滚出窗口时)凭此渲染合并格
          declareRowSpan &&
            declareRowSpan(columnKey, rowKey, {
              start: rowIndex,
              end: rowSpanEnd,
              element: children,
              colSpanEnd: colSpanEnd,
              width: colSpanWidth ? colSpanWidth.width : width,
              minWidth: minWidth,
              flexGrow: colSpanWidth ? colSpanWidth.flexGrow : undefined
            });

          rowColSpanStyles.height = h;
          cellElement = children;
          hasRowSpan = true;
          if (h === 0) {
            cellElement = null;
          }
        }
      }

      if (typeof colSpan !== "undefined") {
        if (colSpan === 0) {
          cellElement = null;
        } else if (colSpan > 1) {
          colSpanEnd = columnIndex + colSpan;
          let columnsStyle = getColumnsWidth(columnIndex, colSpanEnd);
          colSpanWidth = columnsStyle;
          let w = columnsStyle.width;
          columnColSpan.end = colSpanEnd;

          rowColSpanStyles.width = w;
          if (columnsStyle.flexGrow === 1) {
            rowColSpanStyles.flexGrow = 1;
            rowColSpanStyles.flexShrink = 1;
          }

          cellElement = children;

          if (w === 0) {
            cellElement = null;
          }

          //rowSpan+colSpan 组合：补充声明中的跨列信息
          if (hasRowSpan && declareRowSpan) {
            declareRowSpan(columnKey, rowKey, {
              start: rowIndex,
              end: rowIndex + rowSpan,
              element: children,
              colSpanEnd: colSpanEnd,
              width: w,
              minWidth: minWidth,
              flexGrow: columnsStyle.flexGrow
            });
          }
        }
      }
    } else {
      cellElement = renderValue;
    }
  }

  let style = getColumnWidthStyle({ width, minWidth });
  let cellStyles = Object.assign(
    {},
    style,
    extraAttr.style || {},
    propsStyles,
    rowColSpanStyles,
    columnStyle
  );

  let alignStyles = {};
  align && (alignStyles.textAlign = align);

  if (typeof cellElement === "string" || typeof cellElement === "number") {
    cellElement = <CellWithTitle dataIndex={dataIndex} rowColumns={rowColumns} onCellContent={onCellContent} value={cellElement} />;
  }

  let cls = ["tablex-table-row-cell"];
  if (extraAttr.className) {
    cls.push(extraAttr.className);
  }

  if (hasRowSpan === true) {
    cls.push("tablex-table-row-cell-rowspan");
  }

  return (
    <div
      {...extraAttr}
      className={cls.join(" ")}
      style={cellStyles}
      data-columnkey={columnKey}
      data-rowindex={rowIndex}
    >
      {prepend}
      <div className="tablex-table-row-cell-inner" style={alignStyles}>
        {cellElement}
      </div>
    </div>
  );
};

//浅比较两个style对象内容
function styleEquals(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (a[ka[i]] !== b[ka[i]]) return false;
  }
  return true;
}

/**
 * 行级memo比较器：
 * - itemData相同(数据/列引用未变) → 仅比较style(与react-window默认行为一致)
 * - itemData变化时，perfCache开启则按"行对象引用"比较——
 *   上游(formx行级快照)保证行引用=内容版本：行未变则跳过重渲染；
 *   perfCache关闭时保持旧行为(itemData变化即全量重渲染)
 * - 编辑行的显示↔编辑器切换由行key后缀(__editing)触发重挂载，不依赖此比较器
 */
function listItemEquals(prev, next) {
  if (prev.index !== next.index) return false;
  // rowSpan 接管格随虚拟窗口第一行转移(takeover prop 由 PaneRows 每趟计算)，
  // 引用变化即接管权变化，必须重渲——否则旧行 memo bail-out 残留接管格
  if (prev.takeover !== next.takeover) return false;
  // 选中态不再参与比较：行组件内部订阅 selectedRowKeysSignal，
  // 选中变化由 signal 直达重渲(不经过本比较器)，与引用缓存解耦
  if (prev.data === next.data) {
    return styleEquals(prev.style, next.style);
  }
  if (
    prev.data &&
    next.data &&
    prev.data.perfCache !== false &&
    next.data.perfCache !== false
  ) {
    if (prev.data.columns !== next.data.columns) return false;
    if (prev.data.data[prev.index] !== next.data.data[next.index]) {
      return false;
    }
    return styleEquals(prev.style, next.style);
  }
  return false;
}

const ListItem = memo(function TableRow({ data, index, style, takeover }) {
  let {
    data: rows,
    columns,
    rowKey,
    getRowsHeight,
    getColumnsWidth,
    declareRowSpan,
    findRowSpanCover,
    onRow,
    onCell,
    onCellContent,
    rowClassName,
    rowComponent,
    onRowComponent,
    rowRender,
    rowRenderExtra,
    cellRenderExtra,
    placeholders,
    autoItemSize,
    disabledRowSpan,
    allColumns
  } = data;
  let row = rows[index];

  // 订阅选中态(selector布尔化)：仅本行选中态变化时重渲(不经过memo比较)，
  // 选中高亮类(rowClassName)随渲染实时计算
  useSelector(
    data.selectedRowKeysSignal,
    keys => (row ? keys.indexOf(row[rowKey]) > -1 : false)
  );
  // 订阅编辑态(selector布尔化)：本行进入/退出编辑时重渲，
  // 列render包装(编辑器↔显示)随渲染切换；editAll 切换时所有行布尔值变→全行重渲
  useSelector(
    data.editStateSignal,
    state =>
      row
        ? state.editAll === true ||
          state.editKeys.indexOf(row[rowKey]) > -1
        : false
  );
  // 订阅校验版本(本行)：校验结果变化时重渲，编辑器/显示分支的校验态随渲染更新
  useSelector(
    data.validationSignal,
    versions => (row ? versions[row[rowKey]] || 0 : 0)
  );
  // 订阅焦点行(本行布尔)：键盘导航焦点高亮直达重渲
  useSelector(
    data.focusedRowKeysSignal,
    keys => (row ? keys.indexOf(row[rowKey]) > -1 : false)
  );
  // 订阅子级加载态(本行布尔)：异步加载子级时 loading 图标直达重渲
  useSelector(
    data.loadingKeysSignal,
    keys => (row ? keys.indexOf(row[rowKey]) > -1 : false)
  );
  // 订阅展开态(本行布尔)：展开/收起时图标方向直达重渲
  useSelector(
    data.expandedRowKeysSignal,
    keys => (row ? keys.indexOf(row[rowKey]) > -1 : false)
  );

  // 动态行高：行数据引用变化后内容可能收缩(变矮)，通知宿主解除 min 约束
  // 按新内容重测(增长路径由宿主共享 ResizeObserver 自动捕获，无需此处处理)
  const remeasureRowContent = data.remeasureRowContent;
  const prevRowRef = useRef(null);
  useEffect(() => {
    if (
      typeof remeasureRowContent === "function" &&
      prevRowRef.current &&
      prevRowRef.current !== row
    ) {
      remeasureRowContent(index);
    }
    prevRowRef.current = row;
  });

  let placeholderTop = placeholders.top || 0;
  let placeholderBottom = placeholders.bottom || 0;
  let placeholderTotalHeight = placeholderTop + placeholderBottom;

  if (!row) {
    return (
      <div
        style={{ ...style, height: placeholderTotalHeight, zIndex: -1 }}
        className="tablex-row-placeholder"
      />
    );
  }

  let k = row[rowKey];

  let cls = ["tablex-table-row", "tablex-table-row-" + index];

  if (typeof rowClassName === "function") {
    let str = rowClassName({ rowData: row, rowIndex: index });
    cls.push(str);
  }

  let columnColSpan = {
    end: 0
  };

  let rowColumns = (allColumns || columns).map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;
    return {
      key: columnKey,
      title: d.title || columnKey,
      value: row[d.dataIndex],
    }
  })
  let rowCells = columns.map((d, i) => {
    let columnKey = d.key || d.dataIndex || i;

    let columnStyle = {};

    // rowSpan 接管渲染：起始行已滚出虚拟窗口，本行为窗口第一行，
    // 以声明(起始行 render 的输出快照)渲染合并格并回退到合并区起点
    let takeoverDecl =
      disabledRowSpan !== true && takeover ? takeover[columnKey] : null;

    if (takeoverDecl) {
      if (takeoverDecl.colSpanEnd > i + 1) {
        columnColSpan.end = takeoverDecl.colSpanEnd;
      }
      return (
        <SpanTakeoverCell
          key={columnKey}
          decl={takeoverDecl}
          rowIndex={index}
          getRowsHeight={getRowsHeight}
          align={d.align}
          columnStyle={columnStyle}
        />
      );
    }

    return (
      <TableCell
        key={columnKey}
        rowKey={k}
        columnKey={columnKey}
        row={row}
        rowIndex={index}
        rowColumns={rowColumns}
        rowHeight={style.height}
        columnIndex={i}
        columnStyle={columnStyle}
        cellRenderExtra={cellRenderExtra}
        getRowsHeight={getRowsHeight}
        getColumnsWidth={getColumnsWidth}
        columnColSpan={columnColSpan}
        declareRowSpan={declareRowSpan}
        findRowSpanCover={findRowSpanCover}
        onCell={onCell}
        onCellContent={onCellContent}
        disabledRowSpan={disabledRowSpan}
        {...d}
      />
    );
  });

  /** must be given to row element */
  let virtualStyles = Object.assign({}, style);
  if (placeholderTop > 0) {
    virtualStyles.top = style.top + placeholderTop;
  }

  // rowSpan 层叠：被覆盖行整体垫底(zIndex:-1)，其占位格/内容/边框随行沉底，
  // 合并格(起始行/接管行渲染，正常层序)自上而下覆盖该区域。
  // 为什么降层而非升层：起始行的合并格声明由本行 TableCell 写入，
  // 执行晚于本 render——升层判定首趟必然落空且被 memo bail-out 固化；
  // 而被覆盖行的判定只依赖更小 index 行的声明(渲染顺序保证已就绪)，时序天然正确。
  // 接管行(takeover 非空，窗口第一行)自身渲染合并格，不参与垫底。
  // 行有 contain:layout(独立层叠上下文)，格子级 zIndex 无法跨行生效——
  // 层叠调整必须落在行上；inner 容器以 isolation:isolate 兜底，防止 -1 行
  // 掉出表格容器的绘制层
  if (
    !takeover &&
    typeof data.isRowSpanCovered === "function" &&
    data.isRowSpanCovered(index)
  ) {
    virtualStyles.zIndex = -1;
  }

  // 行级渲染隔离：行均为绝对定位(不参与外部布局)，layout+style包含可跳过
  // 滚动过程中无关行的样式计算与布局传播，加快新行挂载时的提交速度。
  // 不含paint(避免裁剪行内溢出内容如tooltip/下拉)
  virtualStyles.contain = "layout style";

  delete virtualStyles.width;
  if (autoItemSize === true) {
    delete virtualStyles.height;
  }

  let rowProps = {
    className: cls.join(" "),
    "data-rowindex": index,
    style: virtualStyles,
    children: rowCells
  };

  // 动态行高：行元素注册到宿主共享 ResizeObserver(跨栏聚合测量)。
  // 仅默认行元素与 rowRender 路径生效(rowRender 不替换外层元素)；
  // components.row 自定义行组件若未透传 rowProps 则不参与测量
  if (typeof data.registerRowEl === "function") {
    rowProps.ref = data.registerRowEl;
  }

  let rowExtra = {};
  if (typeof rowRenderExtra === "function") {
    rowExtra = rowRenderExtra({
      rowData: row,
      rowKey: k,
      rowIndex: index
    });
  }

  let extraAttr = {};

  /** rowRender used to create row inner element */
  if (typeof rowRender === "function") {
    let r = rowRender({
      rowData: row,
      rowIndex: index,
      rowKey: k,
      children: rowCells,
      extra: rowExtra
    });
    if (typeof r !== "undefined") {
      rowProps.children = r;
    } else {
      if (typeof onRow === "function") {
        extraAttr = onRow(row, index, rowProps, rowExtra);
      }
    }
  } else {
    if (typeof onRow === "function") {
      extraAttr = onRow(row, index, rowProps, rowExtra);
    }
  }

  if (extraAttr.className) {
    rowProps.className = rowProps.className + " " + extraAttr.className;
  }

  let rowElement = null;

  /** rowComponent used to create row outter element */
  if (typeof rowComponent === "function") {
    let RowCmp = rowComponent;

    let rowComponentProps = {};
    if (typeof onRowComponent === "function") {
      rowComponentProps = onRowComponent(row, index, rowProps, rowExtra);
    }

    let componentProps = {
      ...rowComponentProps,
      ...extraAttr,
      onRowProps: extraAttr,
      rowKey: k,
      rowData: row,
      rowIndex: index,
      rowProps
    };

    rowElement = <RowCmp {...componentProps} />;
  } else {
    if (extraAttr.style) {
      rowProps.style = Object.assign({}, rowProps.style, extraAttr.style || {});
    }

    rowElement = <div {...extraAttr} {...rowProps} />;
  }

  return rowElement;
}, listItemEquals);

class DataList extends Component {
  // 共享 virtualizer 宿主的稳定 api(仅虚拟模式存在)：
  // 读测量缓存(getRowsHeight)与行测量注册(registerRowEl)。
  // RowsApiContext 引用恒定，本组件不会因滚动而重渲
  static contextType = RowsApiContext;

  constructor(props) {
    super(props);
    // rowSpan 声明索引：columnKey -> startRowKey -> decl
    // decl = { start, end, element, colSpanEnd, width, minWidth, flexGrow }
    // 以数据版本(引用)为生命周期：读写两侧自校验，数据换版即整体重建——
    // 永不脏、永不无界增长，无需清理钩子
    this.spanIndexDataRef = null;
    this.spanIndex = {};
  }

  // 确保声明索引对齐当前数据版本(引用比较，O(1))
  ensureSpanIndex() {
    if (this.spanIndexDataRef !== this.props.data) {
      this.spanIndexDataRef = this.props.data;
      this.spanIndex = {};
    }
    return this.spanIndex;
  }

  // 起始行渲染时声明合并区(antd 契约：span 藏在 render 返回值中，只能渲染期发现)
  declareRowSpan = (columnKey, rowKey, decl) => {
    this.ensureSpanIndex();
    let spans = this.spanIndex[columnKey];
    if (!spans) {
      spans = {};
      this.spanIndex[columnKey] = spans;
    }
    spans[rowKey] = decl;
  };

  // 指定行是否被任意列的合并区覆盖(该行整体垫底，见 ListItem 层叠注释)
  isRowSpanCovered = rowIndex => {
    this.ensureSpanIndex();
    for (let columnKey in this.spanIndex) {
      let spans = this.spanIndex[columnKey];
      for (let k in spans) {
        let d = spans[k];
        if (d.start < rowIndex && rowIndex < d.end) {
          return true;
        }
      }
    }
    return false;
  };

  // 查询覆盖指定行的合并区声明(渲染该行的列时判定是否跳过)
  findRowSpanCover = (columnKey, rowIndex) => {
    this.ensureSpanIndex();
    let spans = this.spanIndex[columnKey];
    if (!spans) {
      return null;
    }
    for (let k in spans) {
      let d = spans[k];
      if (d.start < rowIndex && rowIndex < d.end) {
        return d;
      }
    }
    return null;
  };

  // 虚拟窗口第一行的接管集合：起始行已滚出窗口(start < windowMin < end)的
  // 合并区由该行渲染(PaneRows 每趟计算并经 takeover prop 传入行元素)
  getTakeover = windowMin => {
    this.ensureSpanIndex();
    let result = null;
    for (let columnKey in this.spanIndex) {
      let spans = this.spanIndex[columnKey];
      for (let k in spans) {
        let d = spans[k];
        if (d.start < windowMin && windowMin < d.end) {
          if (!result) {
            result = {};
          }
          result[columnKey] = d;
        }
      }
    }
    return result;
  };

  innerElementType = ({ children, style }) => {
    let { columns = [], innerStyle = {} } = this.props;
    let w = 0;
    columns.forEach(d => {
      let cw = getColumnWidthStyle(d).width;
      w = w + cw;
    });

    if (style.height === 0) {
      style.height = "100%";
    }

    return (
      <div
        style={{
          ...style,
          minWidth: w,
          position: "relative",
          // rowSpan 被覆盖行 zIndex:-1 垫底，isolate 兜底防止其掉出
          // 表格容器绘制层(中间无其他层叠上下文时 -1 会落到页面背景之后)
          isolation: "isolate",
          ...innerStyle
        }}
      >
        {children}
      </div>
    );
  };

  getItemSize = index => {
    let { data, rowHeight } = this.props;
    let row = data[index];

    if (!row) {
      let placeholderTotalHeight = this.getPlaceholderHeight();
      return placeholderTotalHeight;
    }

    if (typeof rowHeight === "function") {
      let h = rowHeight(row, index);
      if (typeof h === "number") {
        return h;
      }
      return 40;
    }

    if (typeof rowHeight === "number") {
      return rowHeight;
    }

    return 40;
  };

  getRowsHeight = (start, end) => {
    let { data, rowHeight } = this.props;
    let endIndex = end > data.length ? data.length : end;

    // 虚拟模式：读共享 virtualizer 的测量缓存——measurementsCache[i].start/end
    // 即行顶前缀和，区间高度 O(1) 直取(实测值优先，未测行为估算值)，
    // 且 rowspan 跨行高度与三栏行高保持同源一致
    let vs = this.context && this.context.virtualizer;
    if (vs && endIndex > start) {
      let sm = vs.measurementsCache[start];
      let em = vs.measurementsCache[endIndex - 1];
      if (sm && em) {
        return em.end - sm.start;
      }
      return (endIndex - start) * 40;
    }

    // 非虚拟(ItemList)路径：按 rowHeight 计算
    let rowsHeight = 0;

    if (typeof rowHeight === "function") {
      let h = 0;
      for (let i = start; i < endIndex; i++) {
        let row = data[i];
        if (row) {
          h = h + rowHeight(row, i);
        } else {
          break;
        }
      }
      rowsHeight = h;
    } else {
      rowsHeight =
        (endIndex - start) *
        (typeof rowHeight === "number" ? rowHeight : 40);
    }

    return rowsHeight;
  };

  getRowKey = index => {
    let { rowKey, data } = this.props;
    let row = data[index];
    if (row) {
      return row[rowKey];
    }
    return "";
  };

  getColumnsWidth = (start, end) => {
    let { columns } = this.props;

    let columnsWidth = 0;

    let columnsStyle = {};

    for (let i = start; i < end; i++) {
      let d = columns[i];
      if (d) {
        let widthStyles = getColumnWidthStyle(columns[i]);
        let cw = widthStyles.width;
        columnsWidth = cw + columnsWidth;
        if (widthStyles.flexGrow === 1) {
          columnsStyle.flexGrow = 1;
          break;
        }
      } else {
        break;
      }
    }

    columnsStyle.width = columnsWidth;

    return columnsStyle;
  };

  getItemKey = (index, itemData) => {
    let { rowKey } = this.props;

    let { data } = itemData;
    let row = data[index];
    if (row) {
      // 纯业务行key：编辑态切换已由行组件订阅 editStateSignal 驱动重渲，
      // 不再需要 __editing key后缀强制重挂载(该机制依赖引用传播，易失效)
      return row[rowKey];
    }
    return "";
  };

  getPlaceholderHeight = () => {
    let { placeholders = {} } = this.props;

    let topHeight = placeholders.top || 0;
    let bottomHeight = placeholders.bottom || 0;

    return topHeight + bottomHeight;
  };

  render() {
    let {
      height,
      data,
      rowKey,
      outerRef,
      columns,
      onRow,
      rowClassName,
      rowComponent,
      onRowComponent,
      style,
      onScroll,
      listRef,
      rowRender,
      rowRenderExtra,
      cellRenderExtra,
      placeholders,
      onCell,
      onCellContent,
      // 预渲染缓冲行数：快速滚动(fling)时每帧位移可达千级像素，
      // 2行(80px)缓冲会被瞬间击穿造成白屏，缺省提升至5(可被业务props覆盖)
      overscanCount = 5,
      autoItemSize,
      virtual,
      disabledRowSpan,
      allColumns
    } = this.props;

    let itemData = createItemData(data, columns, rowKey);

    itemData.placeholders = placeholders;
    itemData.perfCache = this.props.perfCache !== false;
    // 编辑态 signal(Editable层实例属性，引用恒定)：ListItem 内部订阅，
    // 编辑态切换直达重渲(不经过memo比较)
    itemData.editStateSignal =
      this.props.editStateSignal || EMPTY_EDIT_SIGNAL;
    // 校验版本 signal(Editable层实例属性)：行订阅本行版本，校验结果变化时重渲
    itemData.validationSignal =
      this.props.validationSignal || EMPTY_MAP_SIGNAL;
    // 焦点行 signal：行订阅本行焦点态，键盘导航高亮直达重渲
    itemData.focusedRowKeysSignal =
      this.props.focusedRowKeysSignal || EMPTY_KEYS_SIGNAL;
    // 子级加载态 signal(expandable层)：行订阅本行loading，异步加载图标直达重渲
    itemData.loadingKeysSignal =
      this.props.loadingKeysSignal || EMPTY_KEYS_SIGNAL;
    // 展开态 signal：行订阅本行展开布尔，展开/收起图标直达重渲
    itemData.expandedRowKeysSignal =
      this.props.expandedRowKeysSignal || EMPTY_KEYS_SIGNAL;
    // 选中态 signal(selection层实例属性，引用恒定)：ListItem 内部订阅，
    // 选中变化时订阅行重渲(不经过memo比较)，不受 itemData 引用缓存影响
    itemData.selectedRowKeysSignal =
      this.props.selectedRowKeysSignal || EMPTY_KEYS_SIGNAL;
    itemData.onRow = onRow;
    itemData.disabledRowSpan = disabledRowSpan;
    itemData.rowClassName = rowClassName;
    itemData.rowComponent = rowComponent;
    itemData.onRowComponent = onRowComponent;
    itemData.rowRender = rowRender;
    itemData.cellRenderExtra = cellRenderExtra;

    itemData.getRowsHeight = this.getRowsHeight;
    itemData.getColumnsWidth = this.getColumnsWidth;
    itemData.onCell = onCell;
    itemData.onCellContent = onCellContent;
    itemData.rowRenderExtra = rowRenderExtra;
    itemData.getRowKey = this.getRowKey;
    // rowSpan 声明索引访问器(稳定方法引用)：TableCell 声明/查覆盖，
    // PaneRows 计算窗口第一行的接管集合(getTakeover)，ListItem 判定被覆盖行垫底
    itemData.declareRowSpan = this.declareRowSpan;
    itemData.findRowSpanCover = this.findRowSpanCover;
    itemData.getTakeover = this.getTakeover;
    itemData.isRowSpanCovered = this.isRowSpanCovered;

    itemData.autoItemSize = autoItemSize;
    itemData.virtual = virtual;
    itemData.allColumns = allColumns;

    // 动态行高测量接口(共享 virtualizer 宿主提供；非虚拟模式为空)
    if (this.context) {
      itemData.registerRowEl = this.context.registerRowEl;
      itemData.remeasureRowContent = this.context.remeasureRowContent;
    }

    let itemCount = data.length;

    if (this.getPlaceholderHeight() > 0) {
      itemCount = itemCount + 1;
    }

    let props = {
      style,
      height: height,
      itemSize: this.getItemSize,
      overscanCount,
      itemKey: this.getItemKey,

      innerElementType: this.innerElementType,
      itemCount: itemCount,
      onScroll: onScroll,
      itemData: itemData,
      ref: listRef,
      outerRef: outerRef,
      // 中栏标记：PaneRows 将其滚动容器注册为共享 virtualizer 的唯一 scroll element
      primary: this.props.primary === true
    };

    if (this.props.virtual === false) {
      return <ItemList {...props}>{ListItem}</ItemList>;
    }

    return <PaneRows {...props}>{ListItem}</PaneRows>;
  }
}

export default DataList;
