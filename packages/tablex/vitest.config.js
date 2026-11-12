const { defineConfig } = require("vitest/config");
const path = require("path");

const datagridSrc = path.resolve(__dirname, "../react-base-datagrid/src");

module.exports = defineConfig({
  resolve: {
    alias: {
      // 源码直连：裸包名与 lib 子路径都重定向到 src。
      // 前缀匹配按插入序：带斜杠键在前(子路径)，裸名最后(否则吞掉子路径)
      "react-base-datagrid/lib/": datagridSrc + "/",
      "react-base-datagrid/lib": datagridSrc + "/index.js",
      "react-base-datagrid": datagridSrc + "/index.js",
      // jsdom 测不到尺寸，直接重写到 mock(注入可控视口)；
      // alias 同时消除 tablex/node_modules 独立副本的双模块 ID 问题
      "react-resize-detector": path.resolve(
        __dirname,
        "test/__mocks__/react-resize-detector.jsx"
      )
    }
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.jsx"],
    setupFiles: ["./test/setup.jsx"]
  },
  // 源码 .js 内含 JSX，显式扩展 esbuild 处理范围
  esbuild: {
    loader: "jsx",
    include: [
      /src\/.*\.js[x]?$/,
      /tablex\/src\/.*\.js[x]?$/,
      /react-base-datagrid\/src\/.*\.js[x]?$/,
      /test\/.*\.jsx$/
    ],
    exclude: []
  }
});
