---
title: 指南
nav: 
    order: 1
---

# Tablex

[![NPM version](https://img.shields.io/npm/v/tablex.svg?style=flat)](https://npmjs.org/package/tablex) [![NPM downloads](http://img.shields.io/npm/dm/tablex.svg?style=flat)](http://npmjs.com/package/tablex)

基于 React 的表格组件

## 安装

`yarn add tablex`

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
10. 表格编辑，键盘导航（上、下、左、右），自定义验证，便捷的数据编辑api
11. 支持行、列合并
12. 支持表格拖动排序、树形表格层级调整
13. 支持shift、拖拽方式快捷选择数据
14. 支持表头行、列合并
15. 支持自动行高度，行高随内容高度变化
16. 支持数据分组
 
