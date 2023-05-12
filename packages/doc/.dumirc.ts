import { defineConfig } from 'dumi';

const BasePath = process.env.DOC_BASE || '/';

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
});
