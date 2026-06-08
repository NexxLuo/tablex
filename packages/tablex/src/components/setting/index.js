import React, { Component, Fragment } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../widgets";
import Modal from "./modal";
import { getConfigs, setConfigs } from "./utils";
import { SettingOutlined } from "@ant-design/icons";

class Setting extends Component {
  modalRef = React.createRef();
  render() {
    return (
      <Fragment>
        <Button
          icon={<SettingOutlined />}
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
