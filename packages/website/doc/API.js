import React, { Component } from "react";

let BaseUrl = process.env.DOCZ_BASE || "";

class CompleteEditFlow extends Component {
  render() {
    return (
      <div>
        <img src={BaseUrl + "/public/completeEdit-flow.png"} />
      </div>
    );
  }
}

export { CompleteEditFlow };
