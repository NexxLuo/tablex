import React, { Component } from "react";

class ContextMenu extends Component {
  _ref = React.createRef();

  state = { data: null };

  timer = null;

  isVisible = false;

  show = ({ left, top, data }) => {
    let el = this._ref.current;

    this.isVisible = true;
    if (el) {

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      el.style.top = top + "px";
      el.style.left = left + "px";
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.removeProperty("height");
      el.style.removeProperty("width");
      el.style.removeProperty("overflow");

      el.focus();
    }

    this.setState({ data });
  };

  hide = () => {
    this.isVisible = false;
    let el = this._ref.current;
    let delay = this.props.hideDelay;

    let fn = () => {
      if (this.props.hideMode === "hidden") {
        el.style.visibility = "hidden";
        el.style.height = "0px";
        el.style.width = "0px";
        el.style.overflow = "hidden";
      } else {
        el.style.display = "none";
      }
    }

    if (el) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (typeof delay === "number" && delay > 0) {
        this.timer = setTimeout(fn, delay);
      } else {
        fn();
      }

    }
  };

  onBlur = () => {
    if (this.props.autoHideOnBlur !== false) {
      this.hide();
    }
  }

  onClick = () => {
    if (this.props.autoHideOnClick !== false) {
      this.hide();
    }
  }

  componentWillUnmount() {
    this.isVisible = false;
  }

  render() {
    let c = null;

    let { content, style, wrapperStyle } = this.props;

    if (typeof content === "function" && this.isVisible) {
      c = content(this.state.data);
    }

    return (
      <div
        className="tablex-row-contextmenu-wrapper"
        ref={this._ref}
        autoFocus={true}
        tabIndex="1"
        onBlur={this.onBlur}
        onClick={this.onClick}
        style={wrapperStyle}
      >
        {c === null ? null : (
          <div className="tablex-row-contextmenu" style={style}>
            {c}
          </div>
        )}
      </div>
    );
  }
}

export default ContextMenu;
