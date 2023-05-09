---
title: 拖动表格
nav:
  order: 4
---

## 属性

> 拖动表格支持所有 Table 属性，以下是新增属性

| 名称               | 类型                               | 是否可缺省 | 默认值 | 描述                                                                          |
| ------------------ | ---------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------- |
| allowDragLevel     | `boolean`                          | `true`     | `N/A`  | 是否允许拖动层级                                                              |
| useDragHandle      | `boolean`                          | `true`     | `N/A`  | 是否使用拖动按钮，此按钮将独占一列                                            |
| dragHandleRender   | `(props: any) => ElementType<any>` | `false`    | `N/A`  | 拖动按钮渲染,useDragHandle:true 时有效                                        |
| dragHandleSelector | `string`                           | `true`     | `N/A`  | 拖动按钮元素选择器,useDragHandle:false 时有效，将会在当前行元素内查找此选择器 |
| canDrag            | `(props: any) => boolean`          | `true`     | `N/A`  | 行是否允许拖动,返回 false 阻止拖拽                                            |
| onDragBegin        | `(props: any) => void`             | `true`     | `N/A`  | 拖动开始事件                                                                  |
| onDragEnd          | `(props: any) => void`             | `true`     | `N/A`  | 拖动结束事件                                                                  |
| canDrop            | `(props: any) => void`             | `true`     | `N/A`  | 是否允许放置,返回 false 阻止放置                                              |
| onDropHover        | `(props: any) => void`             | `true`     | `N/A`  | 放置 hover 事件                                                               |
| onDrop             | `(props: any) => void`             | `true`     | `N/A`  | 放置完成事件                                                                  |
| onDragComplete     | `(props: any) => void`             | `true`     | `N/A`  | 拖动、放置完成事件，此事件中返回拖动后的新数据                                |
| tableRef           | `(innerTableRef: any) => void`     | `true`     | `N/A`  | 获取表格实例                                                                  |

## 示例

> 内部基于`react-dnd`实现

### 仅拖动排序

<code src="./Examples/Draggable/demo1.tsx"></code>


### 可改变层级

<code src="./Examples/Draggable/demo2.tsx"></code>


### 拖拽元素

<code src="./Examples/Draggable/demo3.tsx"></code>


### 自定义拖拽元素

<code src="./Examples/Draggable/demo4.tsx"></code>


### 拖拽元素选择器

<code src="./Examples/Draggable/demo5.tsx"></code>


### 使用 tableRef

<code src="./Examples/Draggable/demo6.tsx"></code>


### 结合表格编辑

<code src="./Examples/Draggable/demo7.tsx"></code>
