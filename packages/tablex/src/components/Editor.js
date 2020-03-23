import React from "react";
import { Tooltip } from "../widgets";
import "./Editor.css";

class Editor extends React.Component {
  elementRef = React.createRef();

  onFocus = () => {
    let el = this.elementRef.current;
    if (el) {
      el.classList.remove("not-focused");
      el.classList.add("focused");
    }
  };

  onBlur = () => {
    let el = this.elementRef.current;
    if (el) {
      el.classList.remove("focused");
      el.classList.add("not-focused");
    }
  };

  onKeyDown = e => {
    let { onKeyDown, rowKey, columnKey } = this.props;
    if (typeof onKeyDown === "function") {
      onKeyDown(e, rowKey, columnKey);
    }
  };

  onClick = e => {
    let { onClick, rowKey, columnKey } = this.props;
    if (typeof onClick === "function") {
      onClick(e, rowKey, columnKey);
    }
  };

  render() {
    let { children, valid, message } = this.props;
    let cls = ["tablex-row-cell-editor"];
    if (valid === false) {
      cls.push("has-error");
    } else {
      cls.push("no-error");
    }

    cls.push("not-focused");

    return (
      <span
        className={cls.join(" ")}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={this.elementRef}
      >
        <Tooltip placement="topLeft" title={message}>
          {children}
        </Tooltip>
      </span>
    );
  }
}

export default Editor;
