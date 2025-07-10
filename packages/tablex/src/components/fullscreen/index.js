import React, { useEffect, useState } from "react";
import { Button, message } from "../../widgets";
import screenfull from "./utils";

const FullscreenTrigger = ({ getElement }) => {
  let [isFullscreen, setIsFullscreen] = useState(false);
  let toggle = () => {
    let el = null;

    if (typeof getElement === "function") {
      el = getElement();
    }
    screenfull
      .toggle(el)
      .then(() => {})
      .catch(() => {
        message.error("无法切换全屏");
      });
  };

  useEffect(() => {
    screenfull.onchange(() => {
      setIsFullscreen(screenfull.isFullscreen);
    });
  }, []);

  if (screenfull.isEnabled) {
    return (
      <Button
        icon={isFullscreen ? "fullscreen-exit" : "fullscreen"}
        onClick={toggle}
        className="table-tools-item"
      >
        {isFullscreen ? "退出全屏" : "全屏"}
      </Button>
    );
  }
  return null;
};

export default FullscreenTrigger;
