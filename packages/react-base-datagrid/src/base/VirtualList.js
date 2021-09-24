import React, { useImperativeHandle } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import { useVirtual } from "react-virtual";

function VirtualList(props, ref) {
  let {
    style,
    height,
    innerElementType,
    itemSize,
    itemKey,
    itemCount,
    itemData
  } = props;

  const parentRef = React.useRef();

  const stateRef = React.useRef({
    current: {
      scrollUpdateWasRequested: false
    }
  });

  let rows = itemData.data;

  const rowVirtualizer = useVirtual({
    size: itemCount,
    parentRef
  });

  useImperativeHandle(ref, () => ({
    resetAfterIndex: () => {},
    scrollTo: scrollOffset => {
      rowVirtualizer.scrollToOffset(scrollOffset);
      stateRef.current.scrollUpdateWasRequested = true;
    },
    scrollToItem: (index, align = "auto") => {
      rowVirtualizer.scrollToIndex(index);
      stateRef.current.scrollUpdateWasRequested = true;
    }
  }));

  function onScroll(e) {
    let { onScroll } = props;

    let scrollUpdateWasRequested = stateRef.current.scrollUpdateWasRequested;

    if (typeof onScroll === "function") {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: scrollUpdateWasRequested
      });
    }

    stateRef.current.scrollUpdateWasRequested = false;
  }

  let Children = props.children;

  return (
    <div
      ref={parentRef}
      style={{
        position: "relative",
        height: height,
        overflow: "auto",
        direction: "ltr",
        ...style
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: "100%",
          position: "relative"
        }}
      >
        {rowVirtualizer.virtualItems.map(virtualRow => {
          let index = virtualRow.index;
          let h = itemSize(index);
          let k = itemKey(index, itemData);
          return (
            <div
              key={k}
              ref={virtualRow.measureRef}
              style={{
                position: "absolute",
                top: `${virtualRow.start}px`,
                left: 0,
                width: "100%",
                minHeight: h
              }}
            >
              <Children data={itemData} index={index} style={{}}></Children>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.forwardRef(VirtualList);
