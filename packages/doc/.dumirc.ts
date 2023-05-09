import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  favicons: false,
  themeConfig: {
    logo: '/logo-128.png',
    footer: false,
    name: 'Tablex',
    prefersColor: { default: 'auto', switch: true },
  },
});
