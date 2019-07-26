import React, { Component } from "react";
import 'babel-polyfill';

class index extends Component {
  a = () => {
    return new Promise(resolve => {
      resolve();
    });
  };

  render() {
    return <div />;
  }
}

export default index;
