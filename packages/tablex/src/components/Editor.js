import React from "react";
import Tooltip from "antd/lib/tooltip";
import "./Editor.css";

class Editor extends React.Component {
  state = {
    focused: false
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
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

    if (this.state.focused === false) {
      cls.push("not-focused");
    } else {
      cls.push("focused");
    }

    return (
      <span
        className={cls.join(" ")}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <Tooltip placement="topLeft" title={message}>
          {children}
        </Tooltip>
      </span>
    );
  }
}

export default Editor;
