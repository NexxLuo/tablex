import React from "react";
import "../docs/Examples/Other/styles.css";

/** 全局参数：表格类组件需要足够的渲染高度 */
export const parameters = {
  layout: "fullscreen",
  options: {
    storySort: {
      order: ["性能测试场", "基础用法", "行选择", "编辑", "更多用法", "自定义组件", "拖动表格", "配置记忆"],
    },
  },
};

/** 让 demo 组件在可视区域内可伸缩，方便观察虚拟滚动 */
export const decorators = [
  (Story) => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "8px 12px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Story />
      </div>
    </div>
  ),
];
