import { css } from "docz-plugin-css";
import { css as scss } from "styled-components";
export default {
  title: "Tablex",
  themeConfig: {
    styles: {
      playground: scss`
      padding:40px;
      height:100%;
      overflow:auto;
      `
    }
  },
  port: 8888,
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

  
  /** 左侧菜单排序 */
  menu: ["Intro"]
};
