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
      .entry("app")
      .prepend("babel-polyfill")
      .end();

    config.resolve.alias
      .set("react", path.resolve("node_modules/react"))
      .set("react-dom", path.resolve("node_modules/react-dom"));

    config.module
      .rule("js_node_modules")
      .test(/\.(js)$/)
      .include.add(path.resolve("node_modules"))
      .end()
      .use("babel")
      .loader(path.resolve("node_modules/babel-loader"))
      .options({
        presets: [["@babel/preset-env", { modules: false }]]
      });

    config.module.rule("js_node_modules").before("js");
  },
  menu: [
    "介绍",
    "属性",
    "API方法",
    "基础用法",
    "行选择",
    "编辑",
    "拖动表格",
    "更多用法",
    "自定义组件",
    "配置记忆",
    "demo预览"
  ]
};
