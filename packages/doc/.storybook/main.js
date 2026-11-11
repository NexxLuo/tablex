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
    options: {},
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
    ];

    config.resolve.dedupe = [
      ...(config.resolve.dedupe || []),
      "react",
      "react-dom",
    ];

    // 依赖扫描器(dev 模式 optimizeDeps)为独立 esbuild 进程，不经过上述插件，
    // 需通过 loader 映射让扫描器识别源码 .js 中的 JSX
    config.optimizeDeps = {
      ...config.optimizeDeps,
      esbuildOptions: {
        ...((config.optimizeDeps && config.optimizeDeps.esbuildOptions) || {}),
        loader: {
          ...((config.optimizeDeps &&
            config.optimizeDeps.esbuildOptions &&
            config.optimizeDeps.esbuildOptions.loader) ||
            {}),
          ".js": "jsx",
        },
      },
    };

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
