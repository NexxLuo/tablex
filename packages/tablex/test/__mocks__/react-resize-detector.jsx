import React from "react";

// jsdom 测不到容器尺寸：withResizeDetector 直接注入可控视口尺寸
// （经 __testHeight/__testWidth props，缺省 400/1000）
export function withResizeDetector(Component) {
  const WithSize = props => {
    const { __testHeight = 400, __testWidth = 1000, ...rest } = props;
    return <Component {...rest} height={__testHeight} width={__testWidth} />;
  };
  WithSize.displayName =
    "WithResizeDetector(" + (Component.displayName || Component.name || "Component") + ")";
  return WithSize;
}

export default { withResizeDetector };
