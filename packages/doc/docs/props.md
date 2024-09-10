---
title: 文档
nav:
  order: 2
---

<style>
table th:first-of-type {
    width: 240px;
}
table th:nth-of-type(3) {
    width: auto;
}
table th:nth-of-type(4) {
    width: auto;
}
</style>

## 属性

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| rowKey | `string` | `false` | `N/A` | 数据行主键字段 |
| columns | [column[]](#columns) | `true` | `N/A` | 表格列 |
| data | `any[]` | `true` | `N/A` | 表格数据 |
| rowHeight | `number \| ((record: object, index: number) => number)` | `true` | `N/A` | 行高 |
| headerRowHeight | `number \| number[]` | `true` | `N/A` | 表头行高 |
| minHeight | `number` | `true` | `N/A` | 表格区域最小高度 |
| maxHeight | `number` | `true` | `N/A` | 表格区域最大高度 |
| autoHeight | `boolean` | `true` | `N/A` | 是否自动高度，为true时表格的高度将会随行数而变化 |
| autoRowHeight | `boolean` | `true` | `N/A` | 自动行高度,此选项一定程度下会牺牲一些性能 |
| virtual | `boolean` | `true` | `N/A` | 是否启用虚拟滚动 |
| rowClassName | `(record: any, index: number) => string` | `true` | `N/A` | 自定义的行样式名 |
| showHeader | `boolean` | `true` | `N/A` | 是否显示表头 |
| bordered | `boolean` | `true` | `N/A` | 是否显示边框 |
| hoverable | `boolean` | `true` | `N/A` | 是否使用鼠标hover样式 |
| components | `TableComponents` | `true` | `N/A` | 覆盖table元素 |
| scrollRef | `(ref: ElementType<any>) => void` | `true` | `N/A` | 获取数据滚动区域ref |
| innerRef | `(ref: ElementType<any>) => void` | `true` | `N/A` | 获取内部表格ref |
| rowRender | `({ rowData: object, rowIndex: number, children: any }: { rowData: any; rowIndex: any; children: any; }) => ReactNode` | `true` | `N/A` | 自定义行内渲染 |
| onRow | `(record: any, index: number) => object` | `true` | `N/A` | 自定义行属性，可处理行事件 |
| frozenRender | [frozenRender](#frozenrender) | `true` | `N/A` | 固定行数据渲染 |
| onCell | `(row: object, rowIndex: number, extra: object) => object` | `true` | `N/A` | 设置单元格属性 |
| columnDropMenu | `boolean` | `true` | `N/A` | 是否启用列标题配置项菜单 |
| columnDropMenuOptions | `{ fixable: boolean; filterable: boolean; groupable: boolean; }` | `true` | `N/A` | 列下拉配置项 |
| contextMenu | `(row: any) => ReactNode` | `true` | `N/A` | 行右键菜单渲染 |
| orderNumber | `false \|` [column](#columns) | `true` | `N/A` | 排序列配置 |
| pagination | `false \|` [pagination](#pagination) | `true` | `N/A` | 分页配置 |
| showRefresh | `boolean` | `true` | `N/A` | 是否显示底部刷新按钮 |
| onRefresh | `(pageIndex: any, pageSize: any) => void` | `true` | `N/A` | 刷新按钮事件 |
| defaultGroupedColumnKey | `string[]` | `true` | `N/A` | 默认分组列 |
| groupedColumnKey | `string[]` | `true` | `N/A` | 根据此列进行数据分组 |
| autoRowSpanColumns | `string[]` | `true` | `N/A` | 相邻行的列值一致时自动进行合并 |
| groupedColumnSummary | `{ style?: object; className?: string; data: any[]; render?: (text: string, value: any, d: any) => ReactNode; }` | `true` | `N/A` | 数据分组列汇总 |
| resetScrollOffset | `boolean` | `true` | `N/A` | 分页发生改变后是否重置滚动条位置 |
| loading | `boolean` | `true` | `N/A` | 数据是否加载中 |
| settable | `boolean` | `true` | `N/A` | 是否可进行属性配置 |
| sortable | `boolean` | `true` | `N/A` | 是否可进行列排序 |
| striped | `boolean` | `true` | `N/A` | 奇偶行颜色间隔 |
| tableId | `string` | `true` | `N/A` | 表格全局id，通过此id记忆表格配置，由于采用localStorage存储配置，需保证id唯一 |
| footerExtra | `() => ReactNode` | `true` | `N/A` | 渲染额外footer，独占一行 |
| summary | [summary](#summary) | `true` | `N/A` | 数据汇总 |
| emptyRenderer | `({ headerHeight: number }: { headerHeight: any; }) => ReactNode` | `true` | `N/A` | 数据为空时的自定义渲染元素 |
| loadingRender | `({ headerHeight: number }: { headerHeight: any; }) => ReactNode` | `true` | `N/A` | 表格loading时的自定义渲染元素 |
| memorizeSortedColumns | `boolean` | `true` | `false` | 是否自动记忆表格当前的列顺序 |
| memorizePageSize | `boolean` | `true` | `false` | 是否记忆表格当前的每页显示数量 |
| onMount | `(pageIndex: any, pageSize: any) => void` | `true` | `N/A` | 表格组件didMount事件 |
| checkStrictly | `boolean` | `true` | `true` | 多选模式是否级联控制checkbox选中状态 |
| selectOnRowClick | `boolean` | `true` | `true` | 点击行时是否选中行 |
| rowSelection | [rowSelection](#rowselection) | `true` | `N/A` | 选择功能配置，配置项详情见下方 |
| selectionColumn | `boolean \|` [column](#columns) | `true` | `true` | 复选列配置 |
| selectionColumnKey | `string` | `true` | `N/A` | 如若设置了此列，复选框将独占一列 |
| expandColumnKey | `string` | `true` | `N/A` | 展开按钮所在的列 |
| expandedRowRender | `(record: any, index: number, indent: number, expanded: boolean) => ReactNode` | `true` | `N/A` | 展开行渲染 |
| onSetExpandedRowRender | `(record: any, index: number) => boolean` | `true` | `N/A` | 展开行渲染事件，可通过此事件条件处理哪些行可展开,返回false将不可展开 |
| expandRowHeight | `number \| ((record: object, index: number) => number)` | `true` | `N/A` | 展开行高度 |
| defaultExpandedRowKeys | `number[] \| string[]` | `true` | `N/A` | 默认展开的行 |
| expandedRowKeys | `number[] \| string[]` | `true` | `N/A` | 展开的行键值 |
| expandOnRowClick | `boolean` | `true` | `N/A` | 点击行时是否展开行 |
| onExpandedRowsChange | `(expandedRowKeys: number[] \| string[]) => void` | `true` | `N/A` | 行展开事件 |
| onExpand | `(expanded: boolean, record: any) => void` | `true` | `N/A` | 点击展开图标时触发 |
| loadChildrenData | `(record: object) => void \| Promise<any>` | `true` | `N/A` | 展开时加载children的方法 (row:object) => Promise |
| indentSize | `number` | `true` | `N/A` | 树形数据，每层的缩进宽度 |
| editable | `boolean` | `true` | `N/A` | 是否允许编辑 |
| keyboardNavigation | `boolean` | `true` | `N/A` | 是否启用键盘导航 |
| editorClickBubble | `boolean` | `true` | `N/A` | 编辑器是否允许点击事件冒泡 |
| showValidateMessage | `boolean` | `true` | `N/A` | 验证失败时是否显示顶部message |
| readOnly | `boolean` | `true` | `N/A` | 是否只读模式，只读模式下，将无法编辑，且无法触发选择事件 |
| editTools | `EditTools` | `true` | `N/A` | 工具栏，工具按钮 |
| editToolsConfig | [editToolsConfig](#edittoolsconfig) | `true` | `N/A` | 工具栏，工具按钮属性配置 |
| extraTools | `(ins: any) => ReactNode` | `true` | `N/A` | 额外的工具栏按钮渲染 |
| edittingToolsShowType | `0 \| 3 \| 1 \| 2` | `true` | `N/A` | 工具栏显示模式  0:不显示任何按钮 1:只显示内置的编辑按钮 2:只显示自定义按钮 3:显示所有按钮 |
| hiddenToolsWhenEditting | `string[]` | `true` | `N/A` | 使用内置编辑模式时，需要在编辑时隐藏的工具栏按钮，目前支持["add","delete"];如果使用onEditSave中的editType做了判断逻辑需使用此配置限制按钮，否则可能导致editType不正确 |
| intl | `any` | `true` | `N/A` | 表格内部显示文案配置 |
| isAppend | `boolean` | `true` | `N/A` | 新增行时，是追加，还是清空当前页数据 |
| ignoreEmptyRow | `boolean` | `true` | `N/A` | 新增时是否忽略空数据行,当所有editor列的值均为空时,此行则视为空数据行 |
| defaultAddCount | `number` | `true` | `N/A` | 新增行时的默认条数 |
| validateTrigger | `"onChange" \| "onBlur" \| "onSave"` | `true` | `N/A` | 验证时机 |
| validateDelay | `number` | `true` | `N/A` | 验证延时 |
| alwaysValidate | `boolean` | `true` | `N/A` | 未修改数据时是否依然验证 |
| alwaysSave | `boolean` | `true` | `N/A` | 处于编辑状态时，点击保存按钮是否始终都进行保存操作，默认情况下如果未修改数据将不会执行onEditSave |
| addAsChanged | `boolean` | `true` | `N/A` | 新增的数据是否作为已更改数据以允许直接保存 |
| validateNoEditting | `boolean` | `true` | `N/A` | 是否验证无编辑状态的列 |
| onBeforeAdd | `() => boolean` | `true` | `N/A` | 新增按钮前置事件，返回false不进入新增状态 ()=>bool |
| onAdd | `(addedData: object[], newData: object[], string: "add") => void` | `true` | `N/A` | 新增按钮事件 |
| rowTemplate | `(index: number) => object` | `true` | `N/A` | 新增时的行数据模板，可通过此项设置默认行数据 |
| onCancel | `() => void` | `true` | `N/A` | 编辑取消事件 |
| onBeforeEdit | `() => boolean` | `true` | `N/A` | 编辑按钮前置事件，返回false不进入编辑状态 |
| onEdit | `() => void` | `true` | `N/A` | 编辑按钮事件 |
| onBeforeDelete | `(selectedKeys: string[]) => boolean` | `true` | `N/A` | 删除按钮前置事件,返回false 不可删除 |
| onDelete | `() => void` | `true` | `N/A` | 删除按钮事件 |
| dataControled | `boolean` | `true` | `N/A` | 数据是否完全受控，如若受控，请在onEditSave、onCancel中自行更新数据源 |
| onEditSave | `(changedRows: object[], newRows: object[], editType: "add" \| "edit" \| "delete") => void \| Promise<any>` | `true` | `N/A` | 内置编辑按钮保存事件 |
| onBeforeSave | `() => boolean` | `true` | `N/A` | 默认确定按钮保存前置事件,返回false取消保存 |
| onComplete | `(modifiedData: { changed: any[]; inserted: any[]; deleted: any[]; data: any[]; }) => void` | `true` | `N/A` | api.completeEdit 触发此事件 |
| onValidate | `(bl: boolean) => void` | `true` | `N/A` | 验证事件 |
| actions | `any` | `true` | `N/A` | actions注册 |
| columnOptions | `{ [columnKey: string]: { visible?: boolean; disabled?: boolean; required?: boolean; }; }` | `true` | `N/A` | 编辑器属性控制 |
| singleRowEdit | `boolean` | `true` | `N/A` | 是否单行编辑 |




### columns

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| title | `ReactNode \| (() => ReactNode)` | `true` | `N/A` | 列头标题 |
| titleRender | `({ colunm: any }: { colunm: any; }) => ReactNode` | `true` | `N/A` | 列头标题自定义渲染 |
| key | `Key` | `true` | `N/A` | 列key |
| dataIndex | `string` | `true` | `N/A` | 列对应的数据索引 |
| render | `(text: any, record: any, index: number, extra: { depth: number; parents: string[]; }) => ReactNode` | `true` | `N/A` | 列自定义渲染 |
| align | `"left" \| "right" \| "center"` | `true` | `N/A` | 数据列内容对齐方式 |
| halign | `"left" \| "right" \| "center"` | `true` | `N/A` | 列头内容对齐方式 |
| minWidth | `number` | `true` | `N/A` | 最小宽度 |
| width | `string \| number` | `true` | `N/A` | 宽度 |
| fixed | `"left" \| "right" \| "none"` | `true` | `N/A` | 列冻结位置 |
| hidden | `boolean` | `true` | `N/A` | 是否隐藏 |
| editingVisible | `boolean` | `true` | `N/A` | 编辑时是否显示 |
| settable | `boolean` | `true` | `N/A` | 是否可进行属性配置 |
| sortable | `boolean` | `true` | `N/A` | 是否可进行列排序 |
| resizable | `boolean` | `true` | `N/A` | 是否可宽度调整 |
| dropMenu | `boolean` | `true` | `N/A` | 是否显示下拉配置菜单 |
| validator | `(text: any, record: any, index: number) => ValidateResult` | `true` | `N/A` | 列验证器 |
| editor | `(value: any, row: object, rowIndex: number, onchange: (e: any) => void, ref: (ins: any) => void, validate: () => void) => ReactNode` | `true` | `N/A` | 列编辑器 |
| colSpan | `number` | `true` | `N/A` | 表头列合并 |
| rowSpan | `number` | `true` | `N/A` | 表头行合并 |
| onCell | `(row: object, rowIndex: number, extra: any) => object` | `true` | `N/A` | 列自定义属性 |
| onHeaderCell | `(column: object) => object` | `true` | `N/A` | 表头列自定义属性 |


### pagination

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| total | `number` | `true` | `N/A` | 数据总数 |
| defaultCurrent | `number` | `true` | `N/A` |  |
| disabled | `boolean` | `true` | `N/A` |  |
| current | `number` | `true` | `N/A` | 当前页码 |
| defaultPageSize | `number` | `true` | `N/A` |  |
| pageSize | `number` | `true` | `N/A` | 总页数 |
| onChange | `(page: number, pageSize?: number) => void` | `true` | `N/A` | 页码改变事件 |
| hideOnSinglePage | `boolean` | `true` | `N/A` |  |
| showSizeChanger | `boolean` | `true` | `N/A` |  |
| pageSizeOptions | `string[]` | `true` | `N/A` |  |
| onShowSizeChange | `(current: number, size: number) => void` | `true` | `N/A` |  |
| showQuickJumper | `boolean \| { goButton?: ReactNode; }` | `true` | `N/A` |  |
| showTotal | `(total: number, range: [number, number]) => ReactNode` | `true` | `N/A` |  |
| size | `string` | `true` | `N/A` |  |
| simple | `boolean` | `true` | `N/A` |  |
| style | `CSSProperties` | `true` | `N/A` |  |
| locale | `Object` | `true` | `N/A` |  |
| className | `string` | `true` | `N/A` |  |
| prefixCls | `string` | `true` | `N/A` |  |
| selectPrefixCls | `string` | `true` | `N/A` |  |
| itemRender | `(page: number, type: "page" \| "prev" \| "next" \| "jump-prev" \| "jump-next", originalElement: ReactElement<HTMLElement, string \| JSXElementConstructor<any>>) => ReactNode` | `true` | `N/A` |  |
| role | `string` | `true` | `N/A` |  |
| showLessItems | `boolean` | `true` | `N/A` |  |
| showRefresh | `boolean` | `true` | `N/A` |  |


### summary

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| style | `object` | `true` | `N/A` | 汇总项样式 |
| title | `{ text: string; column: string; render?: () => ReactNode; }` | `true` | `N/A` | 标题 |
| data | `any[]` | `false` | `N/A` | 汇总项数据 |
| getValue |  `(value: any, row: any, key: string, items:any[]) => number` | `true` | `N/A` | 汇总计算时的列值获取逻辑，默认为数据行中的值 |
| fixed | `boolean` | `true` | `true` | 是否固定在底部 |
| render | `(value: any, dataIndex: string, type: string, index: number) => ReactNode` | `true` | `N/A` | 自定义汇总项渲染 |


### rowSelection

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| areaSelectEnabled | `boolean` | `true` | `false` | 是否启用框选区域选择行 |
| checkStrictly | `boolean` | `false` | `N/A` | 多选模式是否级联控制checkbox选中状态 |
| columnTitle | `Function \| ReactNode` | `false` | `N/A` | 多选框列标题 |
| columnWidth | `number` | `false` | `N/A` | 多选框列宽 |
| fixed | `boolean` | `false` | `true` | 是否固定多选框列 |
| getCheckboxProps | `Function` | `false` | `N/A` | 动态设置选择框属性 |
| disabledCheckedKeys | `string[]` | `false` | `N/A` | 禁用checkbox选择的行key |
| selectedRowKeys | `string[]` | `false` | `N/A` | 选中的行键值 |
| type | `"checkbox" \| "radio" \| "none"` | `false` | `N/A` | 选择模式，单选、复选、不可选 |
| selectType | `"none" \| "single" \| "multiple"` | `false` | `N/A` | 行选择模式，支持checkbox勾选模式下，行选择为单选 |
| selectInverted | `boolean` | `false` | `N/A` | 是否允许点击选中行时，取消选中状态 |
| showCheckbox | `boolean` | `false` | `true` | 是否显示勾选框列 |
| selectOnCheck | `boolean` | `false` | `true` | 行选中时是否勾选 |
| checkOnSelect | `boolean` | `false` | `true` | 勾选时是否同时选中行 |
| onBeforeSelect | `(params: any) => boolean` | `false` | `N/A` | 选择前置事件 |
| onSelect | `(row: any, selected: boolean, selectedRows: any[], extra: any) => void` | `false` | `N/A` | 手动选择/取消选择某行的回调 |
| onUnSelect | `(row: any, selected: boolean, selectedRows: any[], extra: any) => void` | `false` | `N/A` | 取消选中时的回调 |
| onSelectChange | `(keys: string[], rows: any[], extra: any) => void` | `false` | `N/A` | 行选中项发生变化时的回调 |
| onSelectAll | `(selected: boolean, rows: any[], changed: any[]) => void` | `false` | `N/A` | 全选事件 |
| onCheck | `(row: any, checked: boolean, checkedRows: any[], extra: any) => void` | `false` | `N/A` | 手动勾选/取消勾选某行的回调 |
| onBeforeCheck | `(params: any) => boolean` | `false` | `N/A` | 勾选点击前置事件 |
| onCheckChange | `(keys: string[], rows: any[], extra: any) => void` | `false` | `N/A` | 勾选项发生变化时的回调 |
| onCheckAll | `(checked: boolean, rows: any[], changed: any[]) => void` | `false` | `N/A` | 勾选项全选事件 |
| onBeforeCheckAll | `(params: any) => boolean` | `false` | `N/A` | 全选前置事件 |
| onChange | `(keys: string[], rows: any[], extra: any) => void` | `false` | `N/A` | 勾选项发生变化时的回调 |



### editToolsConfig

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| position | `"top" \| "bottom"` | `false` | `N/A` | 工具栏位置 |
| wrapper | `(el: ReactNode, type: any, api: object) => ReactNode` | `true` | `N/A` | 自定义工具栏外层元素 |
| props | `object` | `false` | `N/A` |  |
| itemStyle | `object` | `false` | `N/A` | 工具栏项的样式 |
| editText | `string` | `false` | `N/A` | 编辑按钮文本 |
| editIcon | `string` | `false` | `N/A` | 编辑按钮图标 |
| addText | `string` | `false` | `N/A` | 新增按钮文本 |
| addIcon | `string` | `false` | `N/A` | 新增按钮图标 |
| deleteText | `string` | `false` | `N/A` | 删除按钮文本 |
| deleteIcon | `string` | `false` | `N/A` | 删除按钮图标 |
| okText | `string` | `false` | `N/A` | 确定按钮文本 |
| okIcon | `string` | `false` | `N/A` | 确定按钮图标 |
| cancelText | `string` | `false` | `N/A` | 取消按钮文本 |
| cancelIcon | `string` | `false` | `N/A` | 取消按钮图标 |

### frozenRender

| 名称 | 类型 | 是否可缺省 | 默认值 | 描述 |
| - | - | - | - | - |
| rowHeight | `number` | `true` | `N/A` | 行高 |
| rowKey | `string` | `false` | `N/A` | 数据行唯一key |
| top | `any[]` | `false` | `N/A` | 固定在上方的数据 |
| bottom | `any[]` | `false` | `N/A` | 固定在下方的数据 |
| rowRender | `(props: object) => ReactNode` | `false` | `N/A` | 自定义行渲染 |
| onRow | `(row: object, index: number, rowProps: object, position: "top" \| "bottom") => object` | `true` | `N/A` | 自定义行属性 |
| onCell | `(row: object, rowIndex: number, extra: object) => object` | `true` | `N/A` | 自定义列属性 |
| cellRender | `(value: any, row: object, rowIndex: number, extra: object) => ReactNode` | `true` | `N/A` | 自定义列渲染 |


## API方法

### 数据转换

- 对数据进行树形、平级转换

```javascript
import Table, { flatten, unflatten } from "@sy/framework/lib/widget/table"

//树形数据转换为平级数据，treeData为包含children字段的数组
//list：平级数据，leafs：所有叶节点，roots：所有根节点
let {list, leafs, roots} = flatten(treeData);

//平级数据转树形数据，id、parentId为flatData中标识子父关系的字段名称
let treeData = unflatten(flatData,"id","parentId");
```


###  编辑

- Table提供了一些内置action，可对表格进行快捷操作。可通过actions属性进行调用，如下：

```javascript

class Demo extends React.Component {
  actions = {};
  callApi = () => {
    //通过actions调用
    this.actions.edit();
  };

  render() {
    return <Table actions={this.actions}></Table>;
  }
}

```


- 手动触发默认的编辑动作
> 以下action均同内置的编辑按钮组行为一致，可通过调用以下action手动触发

```javascript
actions = {
     /** 添加n行数据,这将会调用rowTemplate函数-同默认按钮动作 */
    addRange: (n:number)=>{},
    /** 添加数据行-同默认按钮动作 */
    addRows:(rows:[])=>{},
    /** 删除选中数据-同默认按钮动作 */
    delete: ()=>{},
    /** 编辑所有数据-同默认按钮动作 */
    edit:()=>{},
    /** 取消编辑 */
    cancelEdit:()=>{},
    /** 编辑保存，将会触发onEditSave事件 */
    saveEdit:()=>{}
 }
```


- 使用内置action自定义编辑
> 使用以下action自定义编辑时与表格内置的编辑按钮组具有不同的行为，请勿混用

```javascript
actions = {
    /** 编辑指定行
     * @rowKeys 数据行key集合
     */
    editRows:(rowKeys:string[])=>{},
    /** 编辑所有 */
    editAll: ()=>{},
    /** 
     * 删除数据 
     * @rowKeys 数据行key集合，不传入时，默认删除当前选中的行
     * */
    deleteData:(rowKeys:string[])=>{},
    /** 插入数据 */
    insertData: ({ 
        data = [],//需要插入的行数据集合
        parentKey = "",//所属父级，默认根级
        editing = false, //插入后，是否需要处于编辑状态
        prepend = false, //parentKey有效时可用，可以控制插入的数据在父级的首行还是末行
        scrollTo = true, //插入数据后，是否自动滚动到对应行
        startIndex = -1  //无parentKey时有效，控制数据插入到根级的第几行
    })=>{},
    /** 
     * 修改数据 
     * rows 需要修改的数据（平级），数据中必须包含rowKey
     * */
    modifyData:(rows:[{rowKey,...}])=>{},
    /** 
     * 完成编辑，并提交数据更改
     * 每次调用此方法，都将会触发onComplete，可以在onComplete事件中统一对数据进行保存操作
     * */
    completeEdit: (callback)=>{},
    /** 
     * 仅提交编辑的数据更改
     * 不会验证,也不会进入onComplete,且会保持编辑状态
     * */
    commitEdit:(callback)=>{},
    /** 
     * 取消编辑 
     * 调用此方法后，上次未提交的数据更改将被放弃
     * */
    cancelEdit:()=>{},
    /**
     * 获取编辑后的数据，同onComplete中返回的数据一致
     * */
    getDataState:()=>{
      return {
        data,//编辑后的数据
        inserted,//新增的数据
        changed,//修改的数据
        deleted//删除的数据
      }
    }
 }
```

### 其他

```javascript

actions = {
   /** 查找数据行 */
    findData: (fn:(d)=>boolean)=>{},
    /** 筛选数据 */
    filterData: (fn:(d)=>boolean)=>{},
    /** 折叠所有 */
    collapseAll:()=>{},
    /** 展开所有 */
    expandAll: ()=>{},
    /** 展开至指定层级 */
    expandTo:(depth:number)=>{},
    /** 切换节点展开、折叠状态 */
    expandToggle: (row)=>{},
    /** 选中所有 */
    selectAll: ()=>{},
    /** 取消所有选中 */
    unSelectAll: ()=>{},
    /** 切换节点选中状态,影响子级 */
    selectToggle: (row)=>{},

    getData:()=>{return data;},//当前表格的源数据
    getAllData:()=>{      
        return {
        data, //当前表格的源数据
        changedData, //改变的行数据
        addedData, //添加的行数据
        currData //当前表格状态显示的数据
      };
    },

    /** 滚动到指定索引的行 */
    scrollToItem: (index:number,align:"auto"|"center"|"start"|"end")=>{},
    /** 滚动到指定rowKey的行 */
    scrollToRow: (rowKey:string,align:"auto"|"center"|"start"|"end")=>{}

 }

```
