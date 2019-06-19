export const imports = {
  'examples/index.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-index" */ 'examples/index.mdx'
    ),
}
