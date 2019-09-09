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

    if (typeof this.props.content === "function") {
      c = this.props.content(this.state.data);
    }

    return c === null ? null : (
      <div
        className="tablex-row-contextmenu"
        ref={this._ref}
        tabIndex="1"
        autoFocus={true}
        onBlur={this.hide}
        onClick={this.hide}
      >
        {c}
      </div>
    );
  }
}

export default ContextMenu;
