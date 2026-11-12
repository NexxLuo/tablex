import React from "react";
import { vi } from "vitest";

// jsdom 无 ResizeObserver：空实现（固定行高路径不依赖真实测量）
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// react-resize-detector 在 jsdom 中测不到尺寸(注入 undefined 高度会吞掉外部值)，
// mock 为直接注入可控视口尺寸
vi.mock("react-resize-detector", () => {
  return {
    withResizeDetector: Component => {
      const WithSize = props => {
        const { __testHeight = 400, __testWidth = 1000, ...rest } = props;
        return (
          <Component {...rest} height={__testHeight} width={__testWidth} />
        );
      };
      return WithSize;
    }
  };
});
