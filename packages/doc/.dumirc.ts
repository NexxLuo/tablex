import { defineConfig } from 'dumi';

const BasePath = process.env.DOC_BASE || '/';

export default defineConfig({
  outputPath: 'docs-dist',
  publicPath: BasePath,
  favicons: false,
  themeConfig: {
    logo: '/logo-128.png',
    footer: false,
    name: 'Tablex',
    prefersColor: { default: 'auto', switch: true },
  },
});
