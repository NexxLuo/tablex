import React, { createRef } from "react";

import { Virtuoso } from "react-virtuoso";

class ItemList extends React.Component {
  outterElement = null;
  listRef = createRef(null);

  outerRef = ins => {
    let { outerRef } = this.props;
    if (typeof outerRef === "function") {
      outerRef(ins);
    }
    this.outterElement = ins;
  };

  resetAfterIndex() {}

  scrollUpdateWasRequested = false;
  scrollTo = scrollOffset => {
    let list = this.listRef.current;
    if (list) {
      this.scrollUpdateWasRequested = true;
      list.scrollTo({ top: scrollOffset });
    }
  };

  scrollToItem = (index, align = "auto") => {
    let list = this.listRef.current;

    if (list) {
      list.scrollToIndex(index, align);
    }
  };

  onScroll = e => {
    let { onScroll } = this.props;
    console.log("onScroll:", e);

    if (
      typeof onScroll === "function" &&
      this.scrollUpdateWasRequested === false
    ) {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: this.scrollUpdateWasRequested
      });
    }
    this.scrollUpdateWasRequested = false;
  };

  render() {
    let Children = this.props.children;
    let {
      style,
      height,
      innerElementType,
      itemSize,
      itemKey,
      itemCount,
      itemData
    } = this.props;

    return (
      <div
        style={{
          position: "relative",
          height: height,
          overflow: "auto",
          direction: "ltr",
          ...style
        }}
        ref={this.outerRef}
        onScroll={this.onScroll}
      >
        <Virtuoso
          ref={this.listRef}
          style={{ height }}
          totalCount={itemCount}
          onScroll={this.onScroll}
          itemContent={index => {
            let h = itemSize(index);
            let k = itemKey(index, itemData);
            return (
              <Children
                key={k}
                data={itemData}
                index={index}
                style={{ minHeight: h }}
              ></Children>
            );
          }}
        />
      </div>
    );
  }
}

export default ItemList;
