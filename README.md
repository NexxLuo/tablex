# Tablex

[![NPM version](https://img.shields.io/npm/v/tablex.svg?style=flat)](https://npmjs.org/package/tablex)

基于 [react-window](https://github.com/bvaughn/react-window) 的表格组件

Learn more at the [website](https://nexxluo.github.io/tablex)

## Install

```powershell
yarn add tablex
```

```javascript
import React, { Component } from "react";
import { Table, EditableTable } from "tablex";

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

1. 大数据量加载
2. 自适应宽、高
3. 无限级表头
4. 支持树形数据
5. 仿 antd table 样式
6. 兼容 ant table api
7. 列冻结
8. 列宽拖动
9. 表格编辑
10. 表格编辑，支持键盘导航（上、下、左、右）

## Roadmap

1. 列排序
2. 列分组
3. 表格属性设置
4. 自动记忆表格配置
