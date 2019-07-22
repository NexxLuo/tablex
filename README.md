# Tablex

[![NPM version](https://img.shields.io/npm/v/tablex.svg?style=flat)](https://npmjs.org/package/tablex)

基于 [react-window](https://github.com/bvaughn/react-window) 的表格组件

Learn more at the [website](https://nexxluo.github.io/tablex)

Tablex的目标是成为一个可高度扩展、能适用于各种复杂场景的、功能完备的数据表格组件
 
react-base-datagrid 是为 Tablex 服务而生的 ，如果想要更基础的表格组件可查看 packages/react-base-datagrid
 

## Install

```powershell
yarn add tablex
```

```javascript
import React, { Component } from "react";
import Table, { flatten, unflatten } from "tablex";


class Demo extends Component {
  state = {
    data: [],
    columns: []
  };

  render() {
    return (
      <Table rowKey="id" columns={this.state.columns} data={this.state.data} />
    );
  }
}
```

## 特性

1. 虚拟加载
2. 属性配置记忆
3. 高扩展性，可自定义行、列渲染
3. 自适应宽、高
4. 无限级表头
5. 支持树形数据 
7. 类antd table的样式及api
8. 列冻结
9. 列宽拖动
10. 表格编辑，键盘导航（上、下、左、右），自定义验证
 
## Roadmap

1. 数据分组
2. 行、列合并
3. 无限加载


## FAQ

存在固定列时，联动滚动可能会存在少许延迟。这是由于底层react-window的处理导致。此问题只会出现在开发环境，生产模式下不会存在此问题。
表格高度，虚拟加载的表格依赖外层高度，外层需要高度(固定高度或者百分比高度)，或者给table设置minHeight
 