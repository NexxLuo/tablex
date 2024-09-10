import { defineConfig } from 'dumi';
import path from "path";
const BasePath = process.env.DOC_BASE || '/';
const packagesDir = path.resolve(__dirname, "../../packages");

export default defineConfig({
  outputPath: 'docs-dist',
  publicPath: BasePath,
  base: BasePath,
  favicons: false,
  themeConfig: {
    logo: false,
    footer: false,
    name: 'Tablex',
    prefersColor: { default: 'auto', switch: true },
  },
  extraBabelIncludes:[path.join(packagesDir, "tablex","src"),path.join(packagesDir, "react-base-datagrid","src")],
  alias: {
    "tablex": path.join(packagesDir, "tablex","src"),
    "tablex/lib": path.join(packagesDir, "tablex","src"),
    "react-base-datagrid": path.join(packagesDir, "react-base-datagrid","src"),
    "react-base-datagrid/lib": path.join(packagesDir, "react-base-datagrid","src")
  }
});
