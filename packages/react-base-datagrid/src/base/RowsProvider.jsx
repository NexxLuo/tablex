import React, {
  createContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from "react";

import { flushSync } from "react-dom";

import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * 三栏共享行虚拟化宿主 —— TanStack Virtual 官方多 pane 模式。
 *
 * 职责：
 * - 持有唯一的行 virtualizer：middle(主栏)滚动容器为唯一 scroll element，
 *   left/right 侧栏不再各自持有 virtualizer，滚动跟随由宿主命令式写入侧栏
 *   scrollTop 完成(侧栏无滚动监听器，天然无回声问题)——取代旧版
 *   三栏各自虚拟化 + scrollUpdateWasRequested 防回声互写的同步机制
 * - 动态行高(autoRowHeight)：共享 ResizeObserver 观察三栏全部挂载行，
 *   按 index 跨栏聚合 max 后经 virtualizer.resizeItem 写回——三栏行高逐行一致；
 *   实测尺寸以行 key 持久化在 TanStack itemSizeCache，插行/删行自动保留
 *   未变行高度(取代 CalcRowHeightTable 的离屏全量预测量)
 * - 快速滚动(fling)防白屏：速度感知动态 overscan + scroll 事件内 flushSync
 *   同步完成视口渲染
 *
 * 行高取值优先级(estimateSize)：占位行(汇总冻结行) → rowHeight(row,index)
 * 函数 → rowHeight 数字 → 40；已测行由 itemSizeCache(行key键控)自动覆盖。
 * 未测行按估算值参与总高计算(收敛式总高，官方动态模式标准行为)。
 *
 * 上下文拆分：
 * - RowsApiContext：稳定引用的 api(滚动容器/行元素注册、测量、命令式滚动)，
 *   消费方(DataList)不会因滚动而重渲
 * - RowsVersionContext：virtualizer 每次通知后 +1，驱动 PaneRows 重渲
 */

// 稳定 api(方法逐次刷新，对象引用恒定)
export const RowsApiContext = createContext(null);
// 版本号：virtualizer 通知(视口范围/尺寸/总高变化)后递增
export const RowsVersionContext = createContext(0);

/** .tablex-autowrap 对行施加的 CSS min-height 下限 */
const AUTOWRAP_ROW_MIN_HEIGHT = 40;

function RowsProvider(props) {
  const {
    data,
    rowKey,
    rowHeight,
    placeholders,
    viewportHeight,
    overscanCount = 5,
    autoRowHeight,
    children
  } = props;

  const primaryRef = useRef(null);
  const sideScrollersRef = useRef(null);
  if (!sideScrollersRef.current) {
    sideScrollersRef.current = new Set();
  }

  const offsetCbRef = useRef(null);
  const rectCbRef = useRef(null);
  const offsetRef = useRef(0);
  const directionRef = useRef("forward");

  const [dynamicOverscan, setDynamicOverscan] = useState(overscanCount);
  // overscan 状态镜像：滚动处理闭包经 PaneRows(onScroll prop) 持有，
  // 版本未变化时闭包可能过期，比较一律读 ref
  const dynamicOverscanRef = useRef(overscanCount);
  // 版本号：virtualizer 通知、滚动容器注册/注销后递增。
  // 宿主的 children 引用稳定(来自 BaseDataGrid)，宿主自身重渲会 bail out
  // 子树——必须经版本 context 变化驱动 PaneRows 重渲
  const [version, bumpVersion] = useReducer(c => c + 1, 0);

  const speedStateRef = useRef({ lastTime: 0, lastOffset: 0 });
  const idleTimerRef = useRef(null);
  const measureTimerRef = useRef(null);

  // 动态行高测量状态
  const rowsRegistryRef = useRef(null); // Map<index, Set<HTMLElement>> 三栏聚合
  const rowWidthsRef = useRef(null); // WeakMap<el, lastWidth> 宽度变化检测
  const rowRORef = useRef(null);
  const layoutRORef = useRef(null);
  const scrollerWidthsRef = useRef(null); // WeakMap<el, lastWidth>

  // 最新输入经 ref 透传给 virtualizer 闭包，保证选项函数引用稳定：
  // TanStack 的测量缓存(getMeasurements memo)以 getItemKey 等选项引用为
  // 缓存键，每次渲染传入新函数会导致 O(count) 全量测量重算
  const inputRef = useRef(null);
  inputRef.current = {
    data,
    rowKey,
    rowHeight,
    placeholders,
    viewportHeight,
    overscanCount,
    autoRowHeight: autoRowHeight === true
  };

  // 与 DataList 的 itemCount 规则一致：存在汇总冻结行占位时追加一个占位项
  let itemCount = 0;
  if (data instanceof Array) {
    itemCount = data.length;
    const ph = placeholders || {};
    if ((ph.top || 0) + (ph.bottom || 0) > 0) {
      itemCount = itemCount + 1;
    }
  }

  const stableRefs = useRef({
    getScrollElement: () => primaryRef.current,
    estimateSize: i => {
      const { data, rowHeight, placeholders } = inputRef.current;
      const row = data[i];
      if (!row) {
        const ph = placeholders || {};
        return (ph.top || 0) + (ph.bottom || 0);
      }
      if (typeof rowHeight === "function") {
        const h = rowHeight(row, i);
        if (typeof h === "number") {
          return h;
        }
        return 40;
      }
      if (typeof rowHeight === "number") {
        return rowHeight;
      }
      return 40;
    },
    getItemKey: i => {
      const { data, rowKey } = inputRef.current;
      const row = data[i];
      return row ? row[rowKey] : "";
    },
    // 视口高度以 prop 为准(不做滚动元素测量)，与 react-window 行为一致，
    // 首帧与测试环境(jsdom)下渲染结果确定；prop 变化经 useEffect 重新上报
    observeElementRect: (instance, cb) => {
      rectCbRef.current = cb;
      cb({ width: 0, height: inputRef.current.viewportHeight || 0 });
    },
    // 滚动偏移自管理：保存上报回调，避免每次渲染重复订阅时重置滚动位置
    observeElementOffset: (instance, cb) => {
      offsetCbRef.current = cb;
      cb(offsetRef.current);
    }
  }).current;

  // 命令式滚动：同步写入 offset(复刻 react-window/ItemList 语义)。
  // 不走 virtualizer.scrollToOffset/scrollToIndex —— TanStack 3.x 的滚动命令为
  // 异步 rAF 状态机(含 iOS 手势处理)，与既有同步契约不一致
  const applyOffset = offset => {
    offsetRef.current = offset;
    const el = primaryRef.current;
    if (el && el.scrollTop !== offset) {
      el.scrollTop = offset;
    }
    sideScrollersRef.current.forEach(s => {
      if (s.scrollTop !== offset) {
        s.scrollTop = offset;
      }
    });
    // jsdom 等环境 scrollTop 赋值不派发 scroll 事件，手动上报视口偏移；
    // 浏览器中随后的 scroll 事件因 offset 无变化被 handlePrimaryScroll 跳过
    if (offsetCbRef.current) {
      offsetCbRef.current(offset);
    }
  };

  const scrollToFn = offset => {
    applyOffset(offset);
  };

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: stableRefs.getScrollElement,
    estimateSize: stableRefs.estimateSize,
    overscan: dynamicOverscan,
    getItemKey: stableRefs.getItemKey,
    observeElementRect: stableRefs.observeElementRect,
    observeElementOffset: stableRefs.observeElementOffset,
    scrollToFn: scrollToFn,
    // virtualizer 通知(视口范围/尺寸/总高变化)→ 版本 context 递增 → PaneRows 重渲
    onChange: () => {
      bumpVersion();
    }
  });

  // ── 动态行高：跨栏聚合测量 ──────────────────────────────────────────────
  // 行以 minHeight: v.size 渲染(内容可撑高、撑高即被 RO 捕获)；三栏各自内容
  // 高度不同，须取 max 写回共享 virtualizer 才能逐行对齐(斑马纹/边框依赖
  // 行元素填满槽位)。内容收缩(编辑变矮/列变宽重排)时元素被 minHeight 卡住
  // 不会自行变矮，由 remeasureRowContent 解除约束按内容重测。

  const resizeIfDiff = (index, size) => {
    const item = virtualizer.measurementsCache[index];
    if (!item || item.size !== size) {
      virtualizer.resizeItem(index, size);
    }
  };

  // 常规重测：直接读各栏行元素当前高度取 max(增长路径，RO 触发)
  const remeasureIndex = index => {
    const registry = rowsRegistryRef.current;
    const els = registry && registry.get(index);
    if (!els || els.size === 0) {
      return;
    }
    let max = 0;
    els.forEach(el => {
      const h = el.offsetHeight;
      if (h > max) {
        max = h;
      }
    });
    if (max > 0) {
      resizeIfDiff(index, max);
    }
  };

  // 内容重测：临时解除 minHeight 约束读取内容自然高度取 max(收缩路径)
  const remeasureRowContent = index => {
    const registry = rowsRegistryRef.current;
    const els = registry && registry.get(index);
    if (!els || els.size === 0) {
      return;
    }
    let max = 0;
    els.forEach(el => {
      const prev = el.style.minHeight;
      el.style.minHeight = "0px";
      const h = el.offsetHeight;
      el.style.minHeight = prev;
      if (h > max) {
        max = h;
      }
    });
    // .tablex-autowrap 的 CSS min-height(40px) 下限
    if (max > 0) {
      resizeIfDiff(index, Math.max(max, AUTOWRAP_ROW_MIN_HEIGHT));
    }
  };

  const getRowRO = () => {
    if (rowRORef.current) {
      return rowRORef.current;
    }
    if (typeof ResizeObserver === "undefined") {
      return null;
    }
    rowRORef.current = new ResizeObserver(entries => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const el = entry.target;
        const index = Number(el.dataset.rowindex);
        if (isNaN(index)) {
          continue;
        }
        const widths = rowWidthsRef.current;
        const prevWidth = widths.get(el);
        widths.set(el, entry.contentRect.width);
        if (prevWidth !== undefined && prevWidth !== entry.contentRect.width) {
          // 行宽变化(列宽调整/容器重排)：内容可能收缩，按内容重测
          remeasureRowContent(index);
        } else {
          remeasureIndex(index);
        }
      }
    });
    return rowRORef.current;
  };

  // 容器宽度变化(窗口缩放等)：全部行内容重新换行，全量清缓存重测
  const getLayoutRO = () => {
    if (layoutRORef.current) {
      return layoutRORef.current;
    }
    if (typeof ResizeObserver === "undefined") {
      return null;
    }
    // 宽度记录表随观察器创建(observe 的初始回调即会读取，不可为 null)
    if (!scrollerWidthsRef.current) {
      scrollerWidthsRef.current = new WeakMap();
    }
    layoutRORef.current = new ResizeObserver(entries => {
      let widthChanged = false;
      for (let i = 0; i < entries.length; i++) {
        const el = entries[i].target;
        const w = entries[i].contentRect.width;
        const prev = scrollerWidthsRef.current.get(el);
        scrollerWidthsRef.current.set(el, w);
        if (prev !== undefined && prev !== w) {
          widthChanged = true;
        }
      }
      if (!widthChanged) {
        return;
      }
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
      }
      measureTimerRef.current = setTimeout(() => {
        virtualizer.measure();
      }, 150);
    });
    return layoutRORef.current;
  };

  // ── 主栏滚动处理 ────────────────────────────────────────────────────────
  const handlePrimaryScroll = e => {
    const offset = e.target.scrollTop;
    const prevOffset = offsetRef.current;

    // 无位移事件(回弹/子像素重复)跳过
    if (offset === prevOffset) {
      return;
    }

    if (offset > prevOffset) {
      directionRef.current = "forward";
    } else {
      directionRef.current = "backward";
    }
    offsetRef.current = offset;

    // 滚动速度(px/ms) → 动态 overscan：
    // 惯性滚动每帧可达千级像素，固定缓冲必然被击穿；高速时临时拉大预渲染范围
    const now = performance.now();
    const sp = speedStateRef.current;
    const dt = now - sp.lastTime;
    const speed = dt > 0 ? Math.abs(offset - sp.lastOffset) / dt : 0;
    sp.lastTime = now;
    sp.lastOffset = offset;

    const baseOverscan = inputRef.current.overscanCount || 5;
    let wantOverscan = baseOverscan;
    if (speed > 2) {
      // >2px/ms(≈120px/帧) 高速
      wantOverscan = Math.max(baseOverscan, 15);
    } else if (speed > 0.5) {
      // >0.5px/ms(≈30px/帧) 中速
      wantOverscan = Math.max(baseOverscan, 8);
    }

    // 静止后回落到基础缓冲，避免常驻多余 DOM
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      dynamicOverscanRef.current = inputRef.current.overscanCount || 5;
      setDynamicOverscan(dynamicOverscanRef.current);
    }, 200);

    if (wantOverscan !== dynamicOverscanRef.current) {
      dynamicOverscanRef.current = wantOverscan;
      setDynamicOverscan(wantOverscan);
    }

    // 侧栏跟随：命令式写入(侧栏无滚动监听器，无回声)
    sideScrollersRef.current.forEach(el => {
      if (el.scrollTop !== offset) {
        el.scrollTop = offset;
      }
    });

    // 同步更新视口：flushSync 强制本次 offset 上报触发的渲染(含动态 overscan
    // 与版本递增)在本帧 paint 前完成——消除快速滚动白屏的关键
    flushSync(() => {
      offsetCbRef.current && offsetCbRef.current(offset);
    });
  };

  // 侧栏(固定列)发起的滚动：用户滚轮/拖动落在侧栏区域时，以主栏为源
  // 驱动完整链路——写主栏 scrollTop 触发其 scroll 事件(handlePrimaryScroll：
  // 侧栏跟随+动态overscan+视口上报)；命令式同步产生的回声事件因 offset
  // 与 offsetRef 相同被直接跳过，无循环。
  // (旧版三栏互写机制中侧栏滚动可发起同步，共享 virtualizer 重构需保留该行为)
  const handleSideScroll = e => {
    const offset = e.target.scrollTop;
    if (offset === offsetRef.current) {
      return;
    }
    const el = primaryRef.current;
    if (el && el.scrollTop !== offset) {
      el.scrollTop = offset;
    }
    // jsdom 等环境主栏赋值不派发事件，手动上报；浏览器中随后的主栏事件
    // 会走完整 handlePrimaryScroll，此处上报幂等
    if (offsetCbRef.current) {
      flushSync(() => {
        offsetCbRef.current(offset);
      });
    }
  };

  // ── 稳定 api(对象引用恒定，方法闭包每次渲染刷新) ────────────────────────
  const apiRef = useRef(null);
  if (!apiRef.current) {
    apiRef.current = {};
  }
  const api = apiRef.current;

  api.virtualizer = virtualizer;
  api.autoRowHeight = autoRowHeight === true;
  api.onPrimaryScroll = handlePrimaryScroll;
  api.onSideScroll = handleSideScroll;
  api.applyOffset = applyOffset;
  api.remeasureRowContent = remeasureRowContent;

  api.registerScroller = el => {
    if (!el || primaryRef.current === el) {
      return;
    }
    primaryRef.current = el;
    const ro = getLayoutRO();
    if (ro) {
      ro.observe(el);
    }
    bumpVersion();
  };

  api.unregisterScroller = el => {
    if (primaryRef.current !== el) {
      return;
    }
    primaryRef.current = null;
    if (layoutRORef.current) {
      layoutRORef.current.unobserve(el);
    }
    bumpVersion();
  };

  api.registerSideScroller = el => {
    if (!el) {
      return;
    }
    sideScrollersRef.current.add(el);
    if (offsetRef.current > 0) {
      el.scrollTop = offsetRef.current;
    }
  };

  api.unregisterSideScroller = el => {
    sideScrollersRef.current.delete(el);
  };

  api.registerRowEl = el => {
    if (!el || inputRef.current.autoRowHeight !== true) {
      return;
    }
    const index = Number(el.dataset.rowindex);
    if (isNaN(index)) {
      return;
    }
    if (!rowsRegistryRef.current) {
      rowsRegistryRef.current = new Map();
      rowWidthsRef.current = new WeakMap();
    }
    let set = rowsRegistryRef.current.get(index);
    if (!set) {
      set = new Set();
      rowsRegistryRef.current.set(index, set);
    }
    set.add(el);
    const ro = getRowRO();
    if (ro) {
      ro.observe(el);
    }
  };

  api.unregisterRowEl = el => {
    if (!el) {
      return;
    }
    const index = Number(el.dataset.rowindex);
    if (isNaN(index)) {
      return;
    }
    const registry = rowsRegistryRef.current;
    if (registry) {
      const set = registry.get(index);
      if (set) {
        set.delete(el);
        if (set.size === 0) {
          registry.delete(index);
        }
      }
    }
    if (rowRORef.current) {
      rowRORef.current.unobserve(el);
    }
    if (rowWidthsRef.current) {
      rowWidthsRef.current.delete(el);
    }
  };

  // 行高外部失效(兼容旧 resetAfterIndex API)：清空全部尺寸缓存全量重测。
  // 动态行高模式下实测尺寸按行 key 自动保留，常规数据变更无需调用
  api.clearMeasurements = () => {
    virtualizer.measure();
  };

  // 目标偏移计算：与 react-window getOffsetForIndexAndAlignment 一致，
  // 尺寸取自共享 virtualizer 测量缓存(实测值优先，未测行为估算值)
  api.getOffsetForIndexAlignment = (index, align = "auto") => {
    const count = virtualizer.options.count;
    const viewportSize = inputRef.current.viewportHeight || 0;

    index = Math.max(0, Math.min(index, count - 1));

    let itemStart = 0;
    for (let k = 0; k < index; k++) {
      const m = virtualizer.measurementsCache[k];
      itemStart += m ? m.size : 40;
    }
    const mk = virtualizer.measurementsCache[index];
    const itemH = mk ? mk.size : 40;

    const maxOffset = itemStart;
    const minOffset = Math.max(0, itemStart - viewportSize + itemH);

    const current = offsetRef.current;

    if (align === "smart") {
      if (
        current >= minOffset - viewportSize &&
        current <= maxOffset + viewportSize
      ) {
        align = "auto";
      } else {
        align = "center";
      }
    }

    switch (align) {
      case "start":
        return maxOffset;
      case "end":
        return minOffset;
      case "center":
        return Math.round(minOffset + (maxOffset - minOffset) / 2);
      case "auto":
      default:
        if (current >= minOffset && current <= maxOffset) {
          return current;
        }
        return current < minOffset ? minOffset : maxOffset;
    }
  };

  // 视口高度 prop 变化(容器 resize)时刷新 rect(自定义观察器不自行跟踪)
  useEffect(() => {
    if (rectCbRef.current) {
      rectCbRef.current({ width: 0, height: viewportHeight || 0 });
    }
  }, [viewportHeight]);

  // overscanCount prop 变化时同步基础缓冲
  useEffect(() => {
    dynamicOverscanRef.current = overscanCount || 5;
    setDynamicOverscan(dynamicOverscanRef.current);
  }, [overscanCount]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
      }
      if (rowRORef.current) {
        rowRORef.current.disconnect();
      }
      if (layoutRORef.current) {
        layoutRORef.current.disconnect();
      }
    };
  }, []);

  return (
    <RowsApiContext.Provider value={api}>
      <RowsVersionContext.Provider value={version}>
        {children}
      </RowsVersionContext.Provider>
    </RowsApiContext.Provider>
  );
}

export default RowsProvider;
