# Tablex

[![NPM version](https://img.shields.io/npm/v/tablex.svg?style=flat)](https://npmjs.org/package/tablex) [![NPM downloads](http://img.shields.io/npm/dm/tablex.svg?style=flat)](http://npmjs.com/package/tablex)

基于 [react-window](https://github.com/bvaughn/react-window) 的表格组件

Learn more at the [website](https://nexxluo.github.io/tablex)


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

## Features

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
 
## Roadmap

1. 数据分组
2. 无限加载


## FAQ

存在固定列时，联动滚动可能会存在少许延迟。此问题只会出现在开发环境，生产模式下不会存在此问题。
 

 ## Breaking Changes

 1. api.completeEdit 不再触发onEditSave事件，改而触发onComplete事件，这是为了实现可连续同时编辑、新增、删除操作而不得不产生的更改，因为当处于此种场景时，原onEditSave事件，无法确定当前的状态是编辑、新增还是删除（因为它们可同时存在）。
    onComplete事件定义如下 ：onComplete:function({newData,inserted,deleted,changed})

 2. api.editRows、api.editAll、api.deleteData、api.insertData、api.modifyData 不再标识对应的编辑状态（原有操作亦无法正确标识），这将会导致使用以上api方法时，默认的保存按钮事件(onEditSave)将无法获取到正确的数据。你应该使用completeEdit、onComplete代替。