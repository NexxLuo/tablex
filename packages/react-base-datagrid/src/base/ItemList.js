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

  scrollToItem = (index, align = "auto") => {
    let el = this.outterElement;

    if (el) {
      let items = el.getElementsByClassName("tablex-table-row");

      let itemCount = items.length;

      index = Math.max(0, Math.min(index, itemCount - 1));

      let item = items[index];
      if (!item) {
        return;
      }

      let scrollOffset = el.scrollTop;
      let size = this.props.height;
      let itemSize = item.offsetHeight;
      let itemOffset = item.offsetTop;

      const maxOffset = itemOffset;

      const minOffset = Math.max(0, itemOffset - size + itemSize);

      if (align === "smart") {
        if (
          scrollOffset >= minOffset - size &&
          scrollOffset <= maxOffset + size
        ) {
          align = "auto";
        } else {
          align = "center";
        }
      }

      let toOffset = el.scrollTop;

      switch (align) {
        case "start":
          toOffset = maxOffset;
          break;
        case "end":
          toOffset = minOffset;
          break;
        case "center":
          toOffset = Math.round(minOffset + (maxOffset - minOffset) / 2);
          break;
        case "auto":
        default:
          if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
            toOffset = scrollOffset;
          } else if (scrollOffset < minOffset) {
            toOffset = minOffset;
          } else {
            toOffset = maxOffset;
          }
      }

      this.scrollTo(toOffset);
    }
  };

  onScroll = e => {
    let { onScroll } = this.props;

    if (typeof onScroll === "function") {
      onScroll({
        scrollOffset: e.target.scrollTop,
        scrollUpdateWasRequested: this.scrollUpdateWasRequested
      });
      this.scrollUpdateWasRequested = false;
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
          direction: "ltr",
          ...style
        }}
        ref={this.outerRef}
        onScroll={this.onScroll}
      >
        {innerElementType({
          style: {
            height: "100%"
          },
          children: itemsArr
        })}
      </div>
    );
  }
}

export default ItemList;
