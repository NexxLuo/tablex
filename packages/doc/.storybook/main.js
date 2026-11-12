const path = require("path");

const packagesDir = path.resolve(__dirname, "../..");
const docNodeModules = path.resolve(__dirname, "../node_modules");

/**
 * tablex Storybook 配置
 * - tablex / react-base-datagrid 直接重定向到 monorepo 源码，改源码即时生效，无需先 build
 * - 源码为 .js 内含 JSX，通过插件按 esbuild jsx loader 编译
 * - react 去重：stories(doc/node_modules) 与源码(root/node_modules) 解析路径不同，
 *   不去重会出现双 React 实例导致 hooks 报错
 */
module.exports = {
  framework: {
    name: "@storybook/react-vite",
    options: {
      // 关闭 StrictMode：dev 下组件双渲染会显著拖慢滚动期间的行更新
      strictMode: false
    },
  },

  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],

  staticDirs: ["../public"],

  viteFinal: async (config) => {
    config.resolve = config.resolve || {};

    const existingAliases = Array.isArray(config.resolve.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve.alias || {}).map(([find, replacement]) => ({
          find,
          replacement,
        }));

    config.resolve.alias = [
      ...existingAliases,
      // monorepo 源码直连
      { find: /^tablex$/, replacement: path.join(packagesDir, "tablex/src") },
      { find: /^tablex\/lib$/, replacement: path.join(packagesDir, "tablex/src") },
      {
        find: /^react-base-datagrid$/,
        replacement: path.join(packagesDir, "react-base-datagrid/src"),
      },
      {
        find: /^react-base-datagrid\/lib$/,
        replacement: path.join(packagesDir, "react-base-datagrid/src"),
      },
      // lib 子路径(如 lib/signal)同样重定向到 src，供 tablex 源码跨包引用
      {
        find: /^react-base-datagrid\/lib\//,
        replacement: path.join(packagesDir, "react-base-datagrid/src/") + "",
      },
    ];

    config.resolve.dedupe = [
      ...(config.resolve.dedupe || []),
      "react",
      "react-dom",
    ];

    // antd@3 的 es/ 目录是"ESM 混入 require()"的产物(rc-switch/rc-menu/antd es 均有)，
    // rollup 的 commonjs 插件无法转换 ESM 中的 require，导致浏览器 "require is not defined"。
    // 根治：强制 antd 与全部 rc-* 组件解析到 lib/（纯 CJS），require 全部由 commonjs 插件正常转换
    config.plugins = [
      ...(config.plugins || []),
      {
        name: "force-antd-cjs-lib",
        enforce: "pre",
        transform(code, id) {
          // transform 钩子在当前构建管线中实证有效(load/resolveId 无效)。
          // antd@3 的 es/ 是"ESM混入require"产物，commonjs 插件无法转换 ESM 中的
          // 顶层 require(随chunk加载即崩)。重定向：es/ 文件读取同包 lib/(纯CJS)内容，
          // commonjs 插件按内容检测到 CJS 并在后续 transform 中正确转换全部 require
          const m = id.match(/^(.*node_modules\/(?:antd|rc-[a-z0-9-]+))\/es\/(.+\.js)$/);
          if (!m) return null;
          const libPath = m[1].replace(/\/es$/, "/lib") + "/" + m[2];
          if (require("fs").existsSync(libPath)) {
            return { code: require("fs").readFileSync(libPath, "utf8"), map: null };
          }
          return null;
        },
      },
    ];

    // 源码 .js 文件内含 JSX（vite 默认只对 .jsx/.tsx 启用 jsx loader）
    const esbuild = require("esbuild");
    config.plugins = [
      ...(config.plugins || []),
      {
        name: "jsx-in-js-for-source",
        enforce: "pre",
        transform(code, id) {
          if (
            id.endsWith(".js") &&
            !id.includes("node_modules") &&
            (id.includes("/tablex/src/") || id.includes("/react-base-datagrid/src/"))
          ) {
            const result = esbuild.transformSync(code, {
              loader: "jsx",
              jsx: "automatic",
              format: "esm",
              sourcemap: true,
            });
            return { code: result.code, map: result.map };
          }
        },
      },
    ];

    return config;
  },
};
