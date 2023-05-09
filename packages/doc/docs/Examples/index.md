---
nav:
  order: 3
---

# 示例

## 基础用法

> 以下是一些基本的用法

### 简单用例

<code id="basic-1"  src="./Basic/demo1.jsx"></code>

### 添加序号

<code id="basic-2"  src="./Basic/demo2.jsx"></code>

### 自定义序号列

<code id="basic-3"  src="./Basic/demo3.jsx"></code>

### 行高设置

<code id="basic-4"  src="./Basic/demo4.jsx"></code>

### 分页

<code id="basic-5"  src="./Basic/demo5.jsx"></code>

### 自定义表头标题

<code id="basic-6"  src="./Basic/demo6.jsx"></code>

### 多表头

<code id="basic-7"  src="./Basic/demo7.jsx"></code>

### 多表头设置表头高度

<code id="basic-8"  src="./Basic/demo8.jsx"></code>

### 隐藏表头

<code id="basic-9"  src="./Basic/demo9.jsx"></code>

### 行边框、行 hover、奇偶行样式

<code id="basic-10"  src="./Basic/demo10.jsx"></code>

### 树形数据

<code id="basic-11"  src="./Basic/demo11.jsx"></code>

### 树样式

<code id="basic-12"  src="./Basic/demo12.jsx"></code>

### 根据行数据条数自动高度

<code id="basic-13"  src="./Basic/demo13.jsx"></code>

## 行选择

> 行数据选择功能相关示例

### 无选择

<code id="selectable-1" src="./Selectable/demo1.jsx"></code>

### 单选模式（默认）

<code id="selectable-2"  src="./Selectable/demo2.jsx"></code>

### 多选模式

<code id="selectable-3"  src="./Selectable/demo3.jsx"></code>

### 复选框多选模式&行单选

<code id="selectable-4"  src="./Selectable/demo4.jsx"></code>

### 禁止部分行选中

<code id="selectable-5"  src="./Selectable/demo5.jsx"></code>

### 树形数据多选，级联控制半选、选中状态

<code id="selectable-6"  src="./Selectable/demo6.jsx"></code>

### 自定义多选框列

<code id="selectable-7"  src="./Selectable/demo7.jsx"></code>

### 快捷选中数据，shift&拖拽

> 支持 shift 多选数据，点击 checkbox 后，下一次点击 checkbox 的同时按下 shift 键，将选中两次点击之间的所有数据； 支持拖拽选中数据，鼠标在 checkbox 所在列进行拖拽操作，将选中拖拽区域中的所有数据；

<code id="selectable-8"  src="./Selectable/demo8.jsx"></code>

## 编辑

> 表格数据编辑相关示例

### 基本编辑及验证

> 编辑有追加模式、非追加模式两种，通过 isAppend=true|false 控制，追加模式不会更改当前表格视图的显示数据，否则将会清空当前表格数据视图（不影响数据）

<code id="editable-1" src="./Editable/demo1.jsx"></code>

### 编辑器无边框

> 此模式，只对 antd 内置的 input、datepicker、inputnumber、select 生效。若想自定义，可通过自定义样式进行覆盖

<code id="editable-2" src="./Editable/demo2.jsx"></code>

### 只读模式

> 只读模式将不显示编辑栏及复选框，也无法进行行选择

<code id="editable-3" src="./Editable/demo3.jsx"></code>

### 数据联动

> 外部数据同表格数据相互联动

<code id="editable-4" src="./Editable/demo4.jsx"></code>

### 新增多行

<code id="editable-5" src="./Editable/demo5.jsx"></code>

### 新增数据时忽略空数据行

<code id="editable-6" src="./Editable/demo6.jsx"></code>

### 自定义工具栏

<code id="editable-7" src="./Editable/demo7.jsx"></code>

### 自定义编辑

> 使用表格内置的 API，使用 api 自定义编辑与表格内置的编辑按钮组具有不同的行为，请勿混用

<code id="editable-8" src="./Editable/demo8.jsx"></code>

### 大数据量树形数据编辑

> 使用表格内置的 API

<code id="editable-9" src="./Editable/demo9.jsx"></code>

## 更多用法

### 异步加载子级

<code id="other-1" src="./Other/demo1.jsx"></code>

### 自定义展开行渲染

<code id="other-2" src="./Other/demo2.jsx"></code>

### 数据汇总

<code id="other-3" src="./Other/demo3.jsx"></code>

### 固定数据行

> 无法同 summary 共存，summary 将会覆盖此配置

<code id="other-4" src="./Other/demo4.jsx"></code>

### 行、列合并

<code id="other-5" src="./Other/demo5.jsx"></code>

### 按列分组&分组汇总

<code id="other-6" src="./Other/demo6.jsx"></code>

### 通过合并列实现数据分组样式

<code id="other-7" src="./Other/demo7.jsx"></code>

### 右键菜单

<code id="other-8" src="./Other/demo8.jsx"></code>

### 动态控制列属性

<code id="other-9" src="./Other/demo9.jsx"></code>

### 表头行、列合并

<code id="other-10" src="./Other/demo10.jsx"></code>

### 自动行高，行高度随内容撑高

<code id="other-11" src="./Other/demo11.jsx"></code>

### 自动行高，自定义展开行

<code id="other-12" src="./Other/demo12.jsx"></code>

### 嵌套子表格

> 父表格 autoRowHeight 为 true 时,子表格应设置 autoHeight 为 true

<code id="other-13" src="./Other/demo13.jsx"></code>

## 自定义组件

> 使用`components`属性定制表格渲染行为

### 使用 react-sortable-hoc 实现行拖动

<code id="other-14" src="./Other/demo14.jsx"></code>
