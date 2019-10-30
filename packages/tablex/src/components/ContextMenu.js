import React, { Component } from "react";

class ContextMenu extends Component {
  _ref = React.createRef();

  state = { data: null };

  show = ({ left, top, data }) => {
    let el = this._ref.current;

    if (el) {
      el.style.top = top + "px";
      el.style.left = left + "px";
      el.style.display = "block";
      el.focus();
    }

    this.setState({ data });
  };

  hide = () => {
    let el = this._ref.current;
    if (el) {
      el.style.display = "none";
    }
  };

  render() {
    let c = null;

    let { content, style, wrapperStyle } = this.props;

    if (typeof content === "function") {
      c = content(this.state.data);
    }

    return (
      <div
        className="tablex-row-contextmenu-wrapper"
        ref={this._ref}
        autoFocus={true}
        tabIndex="1"
        onBlur={this.hide}
        onClick={this.hide}
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
