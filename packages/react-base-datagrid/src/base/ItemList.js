import React from "react";

class ItemList extends React.Component {
  outterElement = null;
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
    if (this.outterElement) {
      this.scrollUpdateWasRequested = true;
      this.outterElement.scrollTop = scrollOffset;
    }
  };

  scrollToItem() {}

  onScroll = e => {
    let { onScroll } = this.props;

    if (typeof onScroll === "function") {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: this.scrollUpdateWasRequested
      });
    }
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

    let itemsArr = [];

    for (let i = 0; i < itemCount; i++) {
      let h = itemSize(i);
      let k = itemKey(i, itemData);
      itemsArr.push(
        <Children
          key={k}
          data={itemData}
          index={i}
          style={{ height: h }}
        ></Children>
      );
    }

    return (
      <div
        style={{
          position: "relative",
          height: height,
          overflow: "auto",
          willChange: "transform",
          direction: "ltr",
          ...style
        }}
        ref={this.outerRef}
        onScroll={this.onScroll}
      >
        {innerElementType({
          style: { height },
          children: itemsArr
        })}
      </div>
    );
  }
}

export default ItemList;
