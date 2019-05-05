export const imports = {
  'examples/fixedColumns.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-fixed-columns" */ 'examples/fixedColumns.mdx'
    ),
  'examples/sticky.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-sticky" */ 'examples/sticky.mdx'
    ),
  'examples/table.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-table" */ 'examples/table.mdx'
    ),
  'examples/treeTable.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "examples-tree-table" */ 'examples/treeTable.mdx'
    ),
}
