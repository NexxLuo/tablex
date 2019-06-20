export function treeToList(arr, idField = "id") {
  let treeList = arr || [];

  //末级节点
  let leafs = [];

  //根
  let roots = [];

  //所有节点
  let list = [];

  let maxDepth = 0;

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    if (!d) {
      continue;
    }

    const childrens = d.children || [];

    d.__depth = 0;

    list.push(d);
    roots.push(d);

    if (childrens.length > 0) {
      getChildren(d, 0, []);
    } else {
      leafs.push(d);
    }
  }

  function getChildren(item, depth, parents) {
    const tempArr = item.children || [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const childrens = d.children || [];

      d.__depth = depth + 1;
      d.__parent = {
        title: item.title,
        key: item[idField],
        width: item.width
      };

      d.__parents = [].concat(parents).concat([item[idField]]);

      list.push(d);

      if (childrens.length > 0) {
        getChildren(d, d.__depth, [].concat(d.__parents));
      } else {
        leafs.push(d);
      }
    }
  }

  if (leafs.length > 0) {
    let sortedArr = [].concat(leafs);
    sortedArr.sort((a, b) => b.__depth - a.__depth);
    maxDepth = sortedArr[0].__depth;
  }

  return { list, leafs, roots, maxDepth };
}

export function treeToFlatten(arr) {
  let treeList = arr || [];

  //末级节点
  let leafs = [];
  //根
  let roots = [];

  //所有节点
  let list = [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    if (!d) {
      continue;
    }
    const childrens = d.children || [];

    list.push(d);
    roots.push(d);

    if (childrens.length > 0) {
      getChildren(d, 0);
    } else {
      leafs.push(d);
    }
  }

  function getChildren(item, depth) {
    const tempArr = item.children || [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const childrens = d.children || [];

      list.push(d);

      if (childrens.length > 0) {
        getChildren(d, depth + 1);
      } else {
        leafs.push(d);
      }
    }
  }

  return { list, leafs, roots };
}

export function getTreeLeafs(arr) {
  let treeList = arr || [];
  //末级节点
  let leafs = [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    if (!d) {
      continue;
    }

    const childrens = d.children || [];

    if (childrens.length > 0) {
      getChildren(d, 0);
    } else {
      leafs.push(d);
    }
  }

  function getChildren(item, depth) {
    const tempArr = item.children || [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const childrens = d.children || [];

      if (childrens.length > 0) {
        getChildren(d, depth + 1);
      } else {
        leafs.push(d);
      }
    }
  }

  return leafs;
}

export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let arr = [];

  for (let i = 0; i < list.length; i++) {
    let d = list[i];

    d.__depth = 0;

    arr.push(d);

    if (expandedKeys.indexOf(d[rowKey]) > -1) {
      if (d.children) {
        setChildren(d, 0);
      }
    }
  }

  function setChildren(c, depth) {
    let cArr = c.children;
    for (let i = 0; i < cArr.length; i++) {
      let d = cArr[i];
      d.__depth = depth + 1;
      arr.push(d);

      if (expandedKeys.indexOf(d[rowKey]) > -1) {
        if (d.children) {
          setChildren(d, depth + 1);
        }
      }
    }
  }

  return arr;
}

export function treeFilter(arr, fn) {
  let treeList = arr || [];

  //根
  let roots = [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    let bl = fn(d, i);

    if (bl === true) {
      if (d.children && d.children.length > 0) {
        d.children = getChildren(d);
      }

      roots.push(d);
    }
  }

  function getChildren(node) {
    const tempArr = node.children || [];

    const nextChildrens = [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];

      let bl = fn(d, i);

      if (bl === true) {
        if (d.children && d.children.length > 0) {
          d.children = getChildren(d);
        }

        nextChildrens.push(d);
      }
    }

    return nextChildrens;
  }

  return roots;
}

export function getScrollbarWidth() {
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串

  if (userAgent.indexOf("Chrome") > -1) {
    return 6;
  }

  var oP = document.createElement("p"),
    styles = {
      width: "100px",
      height: "100px",
      overflowY: "scroll"
    },
    i,
    scrollbarWidth;

  for (i in styles) {
    oP.style[i] = styles[i];
  }
  document.body.appendChild(oP);
  scrollbarWidth = oP.offsetWidth - oP.clientWidth;
  oP.remove();

  return scrollbarWidth;
}

/**
 * 添加选中行
 * @key {Array} 行key
 * @selectedRowKeys {Array} 当前选中的行key
 * @rowKey {string} 数据行主键key字段名
 * @flatData {Array} 展平的表格数据
 * @halfCheckedKeys {Array} 当前半选状态的行key
 */
export function addCheckedKey({
  key,
  selectedRowKeys,
  rowKey,
  flatData,
  halfCheckedKeys
}) {
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);
  let row = flatData.find(d => d[rowKey] === key);
  let parentKeys = [].concat(row.__parents || []);

  if (selectedRowKeys.indexOf(key) === -1) {
    let halfIndex = nextHalfCheckedKeys.indexOf(key);
    if (halfIndex > -1) {
      nextHalfCheckedKeys.splice(halfIndex, 1);
    }
    nextKeys.push(key);
  }

  //父级半选的key
  let parentHalfCheckedKeys = [];

  //子级key
  let childrenSelectedKeys = [];

  flatData.filter(d => {
    let pArr = d.__parents || [];
    let bl = pArr.indexOf(key) > -1;
    let ck = d[rowKey];
    if (bl) {
      if (selectedRowKeys.indexOf(ck) === -1) {
        childrenSelectedKeys.push(ck);
      }
    }
    return bl;
  });

  nextKeys = nextKeys.concat(childrenSelectedKeys);

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];

    let pNode = flatData.find(d => {
      return d[rowKey] === p;
    });

    let childrens = [];
    if (pNode) {
      childrens = pNode.children || [];
    }

    //子级是否全被选中
    let childrensAllChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i][rowKey];
      if (nextKeys.indexOf(cKey) === -1) {
        childrensAllChecked = false;
        break;
      }
    }

    //子级全被选中，则勾选其父节点
    if (childrensAllChecked === true) {
      if (nextKeys.indexOf(p) === -1) {
        nextKeys.push(p);
      }

      //取消半选中父级
      let k = nextHalfCheckedKeys.findIndex(d => d === p);
      if (k > -1) {
        nextHalfCheckedKeys.splice(k, 1);
      }
    } else {
      //未全选，则半选父节点
      if (halfCheckedKeys.indexOf(p) === -1) {
        parentHalfCheckedKeys.push(p);

        //取消选中父级
        let j = nextKeys.findIndex(d => d === p);
        if (j > -1) {
          nextKeys.splice(j, 1);
        }
      }
    }
  }

  let newHalflCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);

  return {
    selectedRowKeys: nextKeys,
    halfCheckedKeys: newHalflCheckedKeys
  };
}

export function removeCheckedKey({
  key,
  selectedRowKeys,
  rowKey,
  flatData,
  halfCheckedKeys
}) {
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);

  let row = flatData.find(d => d[rowKey] === key);

  let parentKeys = [].concat(row.__parents || []);

  //父级半选的key
  let parentHalfCheckedKeys = [];

  //子级key
  let childrenKeys = [];

  flatData.filter(d => {
    let pArr = d.__parents || [];
    let bl = pArr.indexOf(key) > -1;
    if (bl) {
      childrenKeys.push(d[rowKey]);
    }
    return bl;
  });

  //移除子级
  if (childrenKeys.length > 0) {
    for (let i = 0; i < childrenKeys.length; i++) {
      const k = childrenKeys[i];

      //移除选中
      let j = nextKeys.findIndex(d => d === k);
      if (j > -1) {
        nextKeys.splice(j, 1);
      }

      //移除半选
      let m = nextHalfCheckedKeys.findIndex(d => d === k);
      if (m > -1) {
        nextHalfCheckedKeys.splice(m, 1);
      }
    }
  }

  //移除本级选中
  let i = nextKeys.findIndex(d => d === key);
  if (i > -1) {
    nextKeys.splice(i, 1);
  }

  //移除本级半选
  let j = nextHalfCheckedKeys.findIndex(d => d === key);
  if (j > -1) {
    nextHalfCheckedKeys.splice(j, 1);
  }

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];
    let childrens = flatData.filter(d => {
      return (d.__parents || []).indexOf(p) > -1;
    });

    //子级是否全未选中
    let childrensAllUnChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i][rowKey];
      if (nextKeys.indexOf(cKey) > -1) {
        childrensAllUnChecked = false;
        break;
      }
    }

    //子级全未选中，则取消勾选其父节点
    if (childrensAllUnChecked === true) {
      //取消选中父级
      let j = nextKeys.findIndex(d => d === p);
      if (j > -1) {
        nextKeys.splice(j, 1);
      }

      //取消半选父级
      let k = nextHalfCheckedKeys.findIndex(d => d === p);
      if (k > -1) {
        nextHalfCheckedKeys.splice(k, 1);
      }
    } else {
      //否则半选父节点
      if (halfCheckedKeys.indexOf(p) === -1) {
        parentHalfCheckedKeys.push(p);

        //取消选中父级
        let j = nextKeys.findIndex(d => d === p);
        if (j > -1) {
          nextKeys.splice(j, 1);
        }
      }
    }
  }

  let newHalflCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);

  return {
    selectedRowKeys: nextKeys,
    halfCheckedKeys: newHalflCheckedKeys
  };
}

/**
 * 添加选中行
 * @key {Array} 行key
 * @selectedRowKeys {Array} 当前选中的行key
 * @rowKey {string} 数据行主键key字段名
 * @flatData {Array} 展平的表格数据
 * @halfCheckedKeys {Array} 当前半选状态的行key
 * @disabledSelectKeys {Array} 禁用选择的数据行key
 */
export function addCheckedKeyWithDisabled({
  key,
  selectedRowKeys,
  rowKey,
  flatData,
  halfCheckedKeys,
  disabledSelectKeys = []
}) {
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);
  let row = flatData.find(d => d[rowKey] === key);
  let parentKeys = [].concat(row.__parents || []);

  /** 是否允许被选择 */
  function isEnabled(itemKey) {
    return disabledSelectKeys.indexOf(itemKey) === -1;
  }

  //本级是否允许选择
  if (isEnabled(key) === false) {
    return {
      selectedRowKeys,
      halfCheckedKeys
    };
  }

  //父级是否允许选择
  let parentEnableSelect = true;
  for (let i = 0; i < parentKeys.length; i++) {
    const pk = parentKeys[i];
    if (isEnabled(pk) === false) {
      parentEnableSelect = false;
      break;
    }
  }

  if (parentEnableSelect === false) {
    return {
      selectedRowKeys,
      halfCheckedKeys
    };
  }

  if (selectedRowKeys.indexOf(key) === -1) {
    let halfIndex = nextHalfCheckedKeys.indexOf(key);
    if (halfIndex > -1) {
      nextHalfCheckedKeys.splice(halfIndex, 1);
    }

    nextKeys.push(key);
  }

  //父级半选的key
  let parentHalfCheckedKeys = [];

  //子级key
  let childrenSelectedKeys = [];

  flatData.filter(d => {
    let pArr = d.__parents || [];
    let bl = pArr.indexOf(key) > -1;
    let ck = d[rowKey];
    if (bl) {
      if (selectedRowKeys.indexOf(ck) === -1) {
        //子级是否允许被选择
        let isEnableSelect = isEnabled(ck);

        for (let i = 0; i < pArr.length; i++) {
          const cpk = pArr[i];
          if (isEnabled(cpk) === false) {
            isEnableSelect = false;
            break;
          }
        }

        isEnableSelect && childrenSelectedKeys.push(ck);
      }
    }
    return bl;
  });

  nextKeys = nextKeys.concat(childrenSelectedKeys);

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];

    let pNode = flatData.find(d => {
      return d[rowKey] === p;
    });

    let childrens = [];
    if (pNode) {
      childrens = pNode.children || [];
    }

    //子级是否全被选中
    let childrensAllChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i][rowKey];
      if (isEnabled(cKey) && nextKeys.indexOf(cKey) === -1) {
        childrensAllChecked = false;
        break;
      }
    }

    //子级全被选中，则勾选其父节点
    if (childrensAllChecked === true) {
      if (nextKeys.indexOf(p) === -1) {
        isEnabled(p) && nextKeys.push(p);
      }

      //取消半选中父级
      let k = nextHalfCheckedKeys.findIndex(d => d === p);
      if (k > -1) {
        nextHalfCheckedKeys.splice(k, 1);
      }
    } else {
      //未全选，则半选父节点
      if (halfCheckedKeys.indexOf(p) === -1) {
        isEnabled(p) && parentHalfCheckedKeys.push(p);

        //取消选中父级
        let j = nextKeys.findIndex(d => d === p);
        if (j > -1) {
          nextKeys.splice(j, 1);
        }
      }
    }
  }

  let newHalflCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);

  return {
    selectedRowKeys: nextKeys,
    halfCheckedKeys: newHalflCheckedKeys
  };
}
