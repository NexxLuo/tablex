import React, { Component, Fragment } from "react";
import { createPortal } from "react-dom";
import Button from "antd/lib/button";
import Modal from "./modal";
import { getConfigs, setConfigs } from "./utils";

class Setting extends Component {
  modalRef = React.createRef();
  render() {
    return (
      <Fragment>
        <Button
          icon="setting"
          onClick={() => {
            this.modalRef.current.toggle();
          }}
        />
        {createPortal(
          <Modal {...this.props} ref={this.modalRef} />,
          document.body
        )}
      </Fragment>
    );
  }
}

export default Setting;
export { getConfigs };
export { setConfigs };
