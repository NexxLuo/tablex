export const imports = {
  'src/table.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "src-table" */ 'src/table.mdx'
    ),
  'src/treeTable.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "src-tree-table" */ 'src/treeTable.mdx'
    ),
}
