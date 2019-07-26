import { css } from "docz-plugin-css";
import { css as scss } from "styled-components";
export default {
  title: "react-base-datagrid",
  themeConfig: {
    styles: {
      playground: scss`
      padding:40px;
      height:100%;
      overflow:auto;
      `
    }
  },
  port: 8887,
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
  /** 左侧菜单排序 */
  menu: ["Intro"]
};
