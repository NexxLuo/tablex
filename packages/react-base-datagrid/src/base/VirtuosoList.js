import React, { createRef } from "react";

import { Virtuoso } from "react-virtuoso";

class ItemList extends React.Component {
  outterElement = null;
  listRef = createRef(null);

  constructor() {
    super();

    this.stateRef = React.createRef({});

    this.stateRef.current = {
      scrollUpdateWasRequested: false
    };
  }

  outerRef = ins => {
    let { outerRef } = this.props;
    if (typeof outerRef === "function") {
      outerRef(ins);
    }
    this.outterElement = ins;
  };

  resetAfterIndex() {}

  scrollTo = scrollOffset => {
    let list = this.listRef.current;
    if (list) {
      this.stateRef.current.scrollUpdateWasRequested = true;
      list.scrollTo({ top: scrollOffset });
    }
  };

  scrollToItem = (index, align = "auto") => {
    let list = this.listRef.current;

    if (list) {
      this.stateRef.current.scrollUpdateWasRequested = true;

      list.scrollToIndex(index, align);
    }
  };

  onScroll = e => {
    let { onScroll } = this.props;

    let scrollUpdateWasRequested =
      this.stateRef.current.scrollUpdateWasRequested;

    if (typeof onScroll === "function") {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: scrollUpdateWasRequested
      });
    }
    this.stateRef.current.scrollUpdateWasRequested = false;
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
