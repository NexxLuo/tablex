import React from "react";

import { getParentElement } from "./utils";

class Resizer extends React.Component {
  indicatorRef = React.createRef();

  indicatorLine = null;
  lineWidth = 2;

  constructor(props) {
    super(props);
    let el = document.createElement("div");
    el.className = "resizeMarkLine";
    this.indicatorLine = el;
  }

  container = null;

  startLeft = 0;

  startX = 0;
  endX = 0;
  offsetX = 0;
  offsetWidth = 0;

  componentDidMount() {
    let el = this.indicatorRef.current;

    if (el) {
      let a = getParentElement(el, ".tablex-table-head-container");

      this.container = a;
    }
  }

  setLine = () => {
    let line = this.indicatorLine;

    if (this.container) {
      let currentLeft = this.offsetWidth + this.offsetX - this.lineWidth - 1;
      let sl = this.container.scrollLeft;
      this.startLeft = currentLeft - sl;

      line.style.left = this.startLeft + "px";
      this.container.appendChild(line);
    }
  };

  setPosition = () => {
    let line = this.indicatorLine;

    if (line) {
      let distance = this.endX - this.startX;
      let l = this.startLeft - 0 + distance - 0;
      line.style.left = l + "px";
    }
  };

  reset = () => {
    let line = this.indicatorLine;
    if (this.container) {
      this.container.removeChild(line);
    }
  };

  onMouseMove = e => {
    this.endX = e.clientX;

    this.setPosition();

    this.onResize();
  };

  onDocumentSelect() {
    return false;
  }

  setSelectEvent() {
    document.body.onselectstart = function () {
      return false;
    };
  }

  resetSelectEvent() {
    document.body.onselectstart = function () {
      return true;
    };
  }

  onMouseUp = e => {
    this.endX = e.clientX;

    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);

    this.resetSelectEvent();

    this.reset();

    this.onResizeStop();
  };

  onMouseDown = e => {
    this.startX = e.clientX;
    this.endX = e.clientX;

    let p = e.target.parentNode;
    this.offsetX = p.offsetLeft;
    this.offsetWidth = p.offsetWidth;

    this.setLine();

    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);

    this.setSelectEvent();
  };

  onResize = () => {
    let distance = this.endX - this.startX;

    let { onResize, columnKey } = this.props;

    let w = this.offsetX + distance + this.offsetWidth;

    if (typeof onResize === "function") {
      onResize(w, columnKey);
    }
  };

  onResizeStop = () => {
    let distance = this.endX - this.startX;

    let { onResizeStop, columnKey } = this.props;

    let w = this.offsetWidth + distance;

    if (typeof onResizeStop === "function") {
      onResizeStop(w, columnKey);
    }
  };

  onDoubleClick = () => {
    let { columnIndex, columnKey, onResizeStop } = this.props;
    let containerEl = this.props.containerRef.current;
    let outterContainer = this.props.outterRef.current;

    if (containerEl) {
      let rows = containerEl.getElementsByClassName("tablex-table-row");

      let maxWidth = 0;

      let headRows = [];

      if (outterContainer) {
        headRows = outterContainer.getElementsByClassName("tablex-head-row");
      }

      let minWidths = {};
      for (let i = 0; i < headRows.length; i++) {
        const headRow = headRows[i];
        let headCells = headRow.getElementsByClassName(
          "tablex-table-head-cell"
        );
        for (let j = 0; j < headCells.length; j++) {
          const headCell = headCells[j];
          const title = headCell.getElementsByClassName(
            "tablex__head__cell__title"
          )[0];
          let ck = headCell.dataset.columnkey;
          const inner = headCell.getElementsByClassName(
            "tablex__head__cell__title__inner"
          )[0];

          if (inner && title && ck && title.scrollWidth >= title.clientWidth) {
            minWidths[ck] = inner.offsetWidth + 40;
          }
        }
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cell = row.getElementsByClassName("tablex-table-row-cell")[
          columnIndex
        ];
        if (cell) {
          const inner = cell.getElementsByClassName(
            "tablex-table-row-cell-inner"
          )[0];

          const expandIcon = cell.getElementsByClassName(
            "tablex-row-expand"
          )[0];

          let expandIconWidth = 0;

          if (expandIcon) {
            expandIconWidth = expandIcon.offsetLeft + expandIcon.clientWidth
          }

          if (inner) {
            if (inner.scrollWidth > inner.clientWidth) {
              let scrollWidth = inner.scrollWidth + 2 + expandIconWidth;
              if (scrollWidth > maxWidth) {
                maxWidth = scrollWidth;
              }
            } else {
              let child = inner.firstChild;
              if (child && child.offsetWidth !== child.clientWidth) {
                let offsetWidth = child.offsetWidth + 2 + 10 + expandIconWidth;
                if (offsetWidth > maxWidth) {
                  maxWidth = offsetWidth;
                }
              }
            }
          }
        }
      }

      //最小宽度不能小于列头标题真实宽度
      let minWidth = minWidths[columnKey];
      if (typeof minWidth === "number" && minWidth > 0 && minWidth > maxWidth) {
        maxWidth = minWidth;
      }

      if (maxWidth > 0) {
        if (typeof onResizeStop === "function") {
          onResizeStop(maxWidth, columnKey);
        }
      }
    }
  };

  render() {
    return (
      <div
        ref={this.indicatorRef}
        className="resize-handle"
        onMouseDown={this.onMouseDown}
        onDoubleClick={this.onDoubleClick}
      />
    );
  }
}

export default Resizer;
