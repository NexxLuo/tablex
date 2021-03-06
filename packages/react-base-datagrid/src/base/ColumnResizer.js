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
    this.indicatorRef;
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
    document.body.onselectstart = function() {
      return false;
    };
  }

  resetSelectEvent() {
    document.body.onselectstart = function() {
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

  render() {
    return (
      <div
        ref={this.indicatorRef}
        className="resize-handle"
        onMouseDown={this.onMouseDown}
      />
    );
  }
}

export default Resizer;
