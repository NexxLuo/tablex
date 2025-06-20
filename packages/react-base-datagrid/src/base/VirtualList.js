import React, { useImperativeHandle, useLayoutEffect } from "react";

import "./styles.css";

import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList(props, ref) {
  let {
    style,
    height,
    innerElementType,
    autoRowHeight,
    itemSize,
    overscanCount,
  } = props;

  let itemCount = 0,
    itemData = [];

  if (props.itemData?.data instanceof Array && props.itemData.data.length > 0) {
    itemData = props.itemData.data;
    itemCount = itemData.length;
  }

  const parentRef = React.useRef();
  const sizeRef = React.useRef({});

  useLayoutEffect(() => {
    let outerRef = props.outerRef;
    if (typeof outerRef === "function") {
      outerRef(parentRef.current);
    }
  }, []);

  const stateRef = React.useRef({
    current: {
      scrollUpdateWasRequested: false,
    },
  });

  const virtualizer = useVirtualizer({
    count: itemData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: itemSize,
    enabled: true,
    overscan: overscanCount,
    measureElement2: (a, b, c) => {
      let index = a.dataset.index;
      let h = b?.contentRect?.height;
      let fn = props.onItemSizeChange;

      let prev = { ...sizeRef.current };

      let o = {};

      let instances = props.virtualListInstance.current.filter((d) => d !== c);

        instances.forEach((inst) => {

          let container = inst.scrollElement;

          if (container) {
            let rows = container.querySelectorAll(".tablex-table-row");

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];

                let rowIndex = row.dataset.rowindex;

                if (rowIndex ===index) {
                  let currentHeight = row.offsetHeight;
                  if (h>currentHeight) {
                    row.style.height = h + "px";
                  }
                  
                  break;
                }


      
             
            }
          }

        });
    },
  });

  useLayoutEffect(() => {
    props.virtualListInstance.current.push(virtualizer);
  }, [virtualizer]);

  const items = virtualizer.getVirtualItems();

  useImperativeHandle(ref, () => ({
    resetAfterIndex: () => {},
    scrollTo: (scrollOffset) => {
      virtualizer.scrollToOffset(scrollOffset);
      stateRef.current.scrollUpdateWasRequested = true;
    },
    scrollToItem: (index, align = "auto") => {
      virtualizer.scrollToIndex(index);
      stateRef.current.scrollUpdateWasRequested = true;
    },
  }));

  function onScroll(e) {
    let { onScroll } = props;

    let scrollUpdateWasRequested = stateRef.current.scrollUpdateWasRequested;

    if (typeof onScroll === "function") {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: scrollUpdateWasRequested,
      });
    }

    stateRef.current.scrollUpdateWasRequested = false;
  }

  let Children = props.children;

  let itemsArr = null;

  if (autoRowHeight === true) {
    itemsArr = (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${items[0]?.start ?? 0}px)`,
        }}
      >
        {items.map((virtualRow) => {
          const index = virtualRow.index;
          console.log("virtualRow:", virtualRow);

          return (
            <div
              key={virtualRow.key}
              data-index={index}
              ref={virtualizer.measureElement}
              style={{
                minHeight: virtualRow.size,
              }}
            >
              <Children
                data={props.itemData}
                index={index}
                style={{
                  height: "auto",
                }}
              ></Children>
            </div>
          );
        })}
      </div>
    );
  } else {
    itemsArr = items.map((virtualRow) => {
      const index = virtualRow.index;
      let h = virtualRow.size;
      return (
        <Children
          key={virtualRow.key}
          data-index={index}
          ref={virtualizer.measureElement}
          data={props.itemData}
          index={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: h,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        ></Children>
      );
    });
  }

  return (
    <div
      ref={parentRef}
      style={{
        position: "relative",
        height: height,
        overflow: "auto",
        direction: "ltr",
        ...style,
      }}
      onScroll={onScroll}
    >
      {innerElementType({
        style: {
          height: virtualizer.getTotalSize(),
        },
        children: itemsArr,
      })}
    </div>
  );
}

export default React.forwardRef(VirtualList);
