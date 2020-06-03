import React from "react";
import { Tooltip } from "../widgets";
import "./Validator.css";

class Validator extends React.Component {
  render() {
    let { children, valid, message } = this.props;
    let msg = "";
    let cls = ["tablex-row-cell-validator"];
    if (valid === false) {
      msg = message;
      cls.push("has-error");
    } else {
      cls.push("no-error");
    }

    return (
      <div className={cls.join(" ")}>
        <Tooltip placement="topLeft" title={msg} arrowPointAtCenter={true}>
          <div className="tablex-row-cell-validator-msg"></div>
        </Tooltip>
        {children}
      </div>
    );
  }
}

export default Validator;
