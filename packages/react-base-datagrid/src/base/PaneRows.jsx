import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from "react";

import { RowsApiContext, RowsVersionContext } from "./RowsProvider";

/**
 * 分栏行渲染器 —— left/middle/right 三栏各一个，全部消费共享 virtualizer
 * (RowsProvider 宿主持有)，不再各自实例化。
 *
 * - primary(中栏)：滚动容器注册为 virtualizer 的唯一 scroll element，
 *   承接用户滚动事件(onScroll → 宿主处理：动态 overscan/侧栏跟随/flushSync)
 * - 侧栏：滚动容器注册到宿主，scrollTop 由宿主命令式同步；
 *   渲染同一份 getVirtualItems()(行 top 用布局坐标，与主栏 scrollTop 天然对齐)
 * - 行样式：固定行高模式 height: v.size(零行为变化)；
 *   autoRowHeight 模式 minHeight: v.size(内容可撑高，由宿主共享 RO 聚合测量)
 * - ref 契约与旧 VirtualList 一致：
 *   scrollTo(offset) / scrollToItem(index, align) / resetAfterIndex(index, shouldForceUpdate)
 *   (Table/DataList 的 listRef 链零改动)
 */
function PaneRows(props, ref) {
  const {
    style,
    height,
    itemKey,
    itemData,
    children,
    innerElementType,
    outerRef,
    primary
  } = props;

  const api = useContext(RowsApiContext);
  // 订阅版本：virtualizer 通知(视口范围/尺寸/总高变化)时重渲本栏
  useContext(RowsVersionContext);

  const parentRef = useRef(null);

  // 注册滚动容器：primary 为唯一滚动源，侧栏由宿主命令式同步
  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el || !api) {
      return undefined;
    }
    if (primary) {
      api.registerScroller(el);
      return () => api.unregisterScroller(el);
    }
    api.registerSideScroller(el);
    return () => api.unregisterSideScroller(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (typeof outerRef === "function") {
      outerRef(parentRef.current);
    } else if (outerRef && typeof outerRef === "object") {
      outerRef.current = parentRef.current;
    }
  }, [outerRef]);

  useImperativeHandle(ref, () => ({
    // 行高外部失效(兼容旧 API)：清空尺寸缓存全量重测
    resetAfterIndex: () => {
      api.clearMeasurements();
    },
    scrollTo: scrollOffset => {
      api.applyOffset(scrollOffset);
    },
    scrollToItem: (index, align = "auto") => {
      api.applyOffset(api.getOffsetForIndexAlignment(index, align));
    }
  }));

  if (!api) {
    return null;
  }

  const virtualizer = api.virtualizer;
  const autoRowHeight = api.autoRowHeight;

  const items = virtualizer.getVirtualItems();

  // rowSpan 接管集合：合并区起始行已滚出窗口时(start < windowMin < end)，
  // 由窗口第一行(items[0])渲染合并格。每趟计算新对象——takeover prop
  // 引用变化击穿行级 memo，接管权随窗口滑动转移时旧行必然重渲，无残留
  const windowMin = items.length > 0 ? items[0].index : 0;
  const takeoverForWindowMin =
    itemData && typeof itemData.getTakeover === "function"
      ? itemData.getTakeover(windowMin)
      : null;

  // 内层总高与视口范围使用同一套测量(virtualizer.getTotalSize)，
  // 已测行精确、未测行按估算值——不存在"估算区"(总高与范围永远同源)
  const estimatedTotalHeight = virtualizer.getTotalSize();

  const itemsArr = items.map(v =>
    React.createElement(children, {
      key: itemKey ? itemKey(v.index, itemData) : v.key,
      data: itemData,
      index: v.index,
      style: autoRowHeight
        ? {
            // 动态行高：min 高度保证填满槽位(斑马纹/边框对齐)，
            // 内容超出可撑高并由宿主 RO 捕获重测
            position: "absolute",
            left: 0,
            top: v.start,
            minHeight: v.size,
            width: "100%"
          }
        : {
            position: "absolute",
            left: 0,
            top: v.start,
            height: v.size,
            width: "100%"
          },
      // 仅窗口第一行携带接管集合(多数行为 null，不参与 memo 比较)
      takeover: v.index === windowMin ? takeoverForWindowMin : null
    })
  );

  const innerProps = {
    children: itemsArr,
    style: {
      height: estimatedTotalHeight,
      width: "100%"
    }
  };

  return React.createElement(
    "div",
    {
      ref: parentRef,
      style: {
        position: "relative",
        height: height,
        overflow: "auto",
        direction: "ltr",
        // 虚拟滚动自身管理内容定位，禁用浏览器滚动锚定，
        // 避免行高动态变化(totalSize变化)时锚定补偿与虚拟滚动互相干扰造成跳动/闪白
        overflowAnchor: "none",
        ...style
      },
      // 主栏：完整滚动处理；侧栏：以主栏为源转发(固定列上滚轮也可联动)
      onScroll: primary ? api.onPrimaryScroll : api.onSideScroll
    },
    innerElementType
      ? innerElementType(innerProps)
      : React.createElement("div", innerProps)
  );
}

export default forwardRef(PaneRows);
