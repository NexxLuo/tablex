import React, { Component } from "react";
import { Table } from "tablex";
import { Checkbox, Input, Button } from "antd";
import Complex from "../Editable/complex/index.js";

class Demo extends Component {
  render() {
    return (
      <>
        <div style={{ height: "500px" }}>
          <Complex />
        </div>
      </>
    );
  }
}

export default Demo;
