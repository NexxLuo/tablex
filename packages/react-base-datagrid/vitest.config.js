const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.jsx"],
    setupFiles: ["./test/setup.jsx"]
  },
  // 源码 .js 内含 JSX（React.createElement 经典模式），
  // vite 默认 esbuild 只处理 .jsx/.tsx，显式扩展到 src 下的 .js；
  // include 覆盖 src 源码与测试文件两类路径
  esbuild: {
    loader: "jsx",
    include: [/src\/.*\.js[x]?$/, /test\/.*\.jsx$/],
    exclude: []
  }
});
