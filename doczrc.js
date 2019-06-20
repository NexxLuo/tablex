import { css } from "docz-plugin-css";
import { css as scss } from "styled-components";
export default {
    title: "Tablex",
    hashRouter: true,
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
    codeSandbox: true,
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
};
