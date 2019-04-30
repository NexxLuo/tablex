export const imports = {
  'examples/table.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-table" */ 'examples/table.mdx'
    ),
  'examples/treeTable.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-tree-table" */ 'examples/treeTable.mdx'
    ),
}
