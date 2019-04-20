export const imports = {
  'README.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "readme" */ 'README.mdx'
    ),
  'src/table.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "src-table" */ 'src/table.mdx'
    ),
  'src/treeTable.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "src-tree-table" */ 'src/treeTable.mdx'
    ),
}
