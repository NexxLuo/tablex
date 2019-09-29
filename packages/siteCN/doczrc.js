import { css } from "docz-plugin-css";
import { css as scss } from "styled-components";
const path = require("path");


export default {
  title: "Table",
  indexHtml: "./public/index.html",
  public: "./public",
  themeConfig: {
    styles: {
      playground: scss`
      padding:40px;
      height:100%;
      overflow:auto;
      `
    }
  },
  port: 3333,
  codeSandbox: false,
  typescript: false,
  plugins: [
    css({
      preprocessor: "postcss"
    }),
    css({
      preprocessor: "less",
      cssmodules: true
    })
  ],
  filterComponents: files => {
    return files.filter(
      filepath => /[w-]*.(js|jsx|ts|tsx)$/.test(filepath) //default is /\/[A-Z]\w*\.(js|jsx|ts|tsx)
    );
  },
  onCreateWebpackChain: config => {
    config
      .entry("polyfill")
      .add("babel-polyfill")
      .end();

    config.resolve.alias.set("react",  path.resolve("node_modules/react")).set("react-dom", path.resolve("node_modules/react-dom"));
  },
  menu: [
    "介绍",
    "属性",
    "API方法",
    "基础用法",
    "行选择",
    "编辑",
    "进阶用法",
    "自定义组件",
    "配置记忆",
    "demo预览"
  ]
};
