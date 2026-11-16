# 行列合并重构：「span 声明索引 + 接管渲染」（antd 契约完整保留）

## 契约声明（用户要求）

**`render` 返回 `{children, props: {rowSpan/colSpan/style}}` 的 antd 式契约一字不动**——组件原则是与 antd Table 属性保持一致。重构只动内部实现（缓存结构与渲染路径），用户 API、demo 用法、文档语义零变化。

## Context

现行实现别扭在：span 元数据靠渲染各单元格时"顺便发现"，再用两张实例缓存跨渲染趟传递（`columnRowSpan` + `columnRowSpanPlaceholders`），派生出一串问题：渲染期 mutate 缓存、`componentDidUpdate` 无条件清空 hack（数据变更趟仍读脏表）、placeholders 表永不清理（无界增长/数据换版后旧 element 撞车）、起始行主渲染 + 末行幽灵行（RowPlaceholder/CellPlaceholder，`top:-height` 负偏移回填）双份渲染同一 children、zIndex 魔法、窗口落 span 中段时的结构性空洞（demo5 的 `overscanCount=15` 与 `rowSpan=15` 耦合正是调参缓解）。

## 设计

### 1. span 声明索引（替代双缓存）

DataList 实例持单张索引 `columnKey → startRowKey → decl`（`decl = {start, end, element, width, minWidth, flexGrow, colSpanEnd}`）。渲染期发现 span 仍不可避免（antd 契约把 span 藏在 render 返回值里），但索引以**数据版本自校验**：读写方法内部比对 `this.props.data` 引用，不一致即整体重建——永不脏、永不无界增长，清空 hack 删除。同一数据版本内声明跨趟保留，供起始行滚出窗口后接管方使用。

### 2. 接管渲染（替代「主渲染 + 幽灵行」）

- **主渲染**（起始行挂载，常态）：TableCell 在 render 返回中发现 `rowSpan > 1` → 写声明 + 行内渲染 relative 溢出格（现状形态，zIndex 常量化）
- **接管渲染**（起始行滚出窗口）：合并格由**虚拟窗口第一行**渲染——PaneRows 每趟计算 `takeover = { columnKey: decl }`（条件 `decl.start < windowMin < decl.end`）作为 prop 传给 items[0] 的行元素；ListItem 渲染时用统一组件 `SpanTakeoverCell`（relative + `top: -Σheight[start..windowMin)` 回退到合并区起点）**替代**该列的正常格子
- **takeover prop 是解决 memo 残留的关键**：接管权随窗口滑动在行间接力时，prop 引用变化自然击穿行级 memo 的 bail-out——旧行重渲移除接管格，无双份残留
- `height`/`top` 实时从 `getRowsHeight`（共享 virtualizer 测量缓存）重算——动态行高收敛自动生效（现状幽灵用快照会错位）
- 被覆盖行（非接管）与被吃列一致：**提前 return null**，不执行 render
- 中段空洞修复：窗口落 span 中段时窗口第一行接管渲染（原为空白）

### 3. 保持不变

- antd render 契约、colSpan 行内游标（每行渲染新建，本身干净）、tablex 分组表头行 colSpan 注入通道（tablex/Table.js:1102-1261）
- 三栏隔离（列集拆分天然按栏独立）、表头合并（Head.js）、FrozenList、`disabledRowSpan` 兼容

## 文件改动

| 文件 | 改动 |
|---|---|
| `base/DataList.js`（主战场） | 新增 `SpanTakeoverCell` + ROWSPAN_CELL_ZINDEX 常量；TableCell 主路径声明化（删双缓存写入）+ cover 提前 return；ListItem 渲染 takeover 格、删幽灵行段（:694-727）；`listItemEquals` 加 takeover 比较；DataList 类：spanIndex 4 个方法（ensure/declare/findCover/getTakeover）替代双表；删 `componentDidUpdate` 清空；constructor 注释修正 |
| `base/PaneRows.jsx` | items[0] 行传 `takeover` prop（调 `itemData.getTakeover(windowMin)`，~5 行） |
| `tablex/src/Editable.js` | `getAutoRowSpanStore` O(n²) 回扫改单趟 run-length O(n)，行为不变 |
| `packages/doc/docs/props.md` | 补表体合并（render 返回 `{children, props}` 通道）文档——现状零文档 |

## 行为变化（均为改善）

- 被覆盖行（非接管）的 render 不再执行（原先执行后丢弃；colSpan 被吃列已有提前 return 先例）
- span 区间中段不再空白；起始/末行同时在窗时无双份 DOM（重复事件处理器消失）
- 数据换版瞬间窗口外起始行旧声明失效，中段切入短暂无合并视觉，起始行滚入即恢复（不差于现状）

## 验证（Storybook 实测，基线已截取）

1. demo5 首屏/中段截图对比基线；滚动穿越 span 区间三态（起始滚出→接管、中段→接管修复、滚回→主渲染归还）
2. **单份 DOM 断言**：任意滚动位置 `.tablex-table-row-cell-rowspan` 同列唯一（基线实测 scrollTop=280 时为 2 份）
3. demo6/demo7 分组行（colSpan 通道 + `__isGroupedHeadRow`）、demo10 表头合并回归
4. 三栏组合：临时给 demo5 加 `fixed: "left"` 列验证左右/中栏接管一致（验证后还原）
5. 编辑回归：demo3（编辑态解除合并）、demo9（大数据树形）