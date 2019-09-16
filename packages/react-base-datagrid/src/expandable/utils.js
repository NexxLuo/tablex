export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let arr = [];

  let expandeds = {};

  for (let i = 0, len = expandedKeys.length; i < len; i++) {
    expandeds[expandedKeys[i]] = true;
  }

  for (let i = 0, len = list.length; i < len; i++) {
    let d = list[i];
    let index = i + 1;

    arr.push(d);

    if (expandeds[d[rowKey]] === true) {
      if (d.children) {
        setChildren(d, 0, [], [index]);
      }
    }
  }

  function setChildren(c) {
    let c_childrens = c.children;

    for (let i = 0, len = c_childrens.length; i < len; i++) {
      let d = c_childrens[i];
      arr.push(d);
      if (expandeds[d[rowKey]] === true) {
        if (d.children) {
          setChildren(d);
        }
      }
    }
  }

  return { data: arr };
}

export function getTreeProps(arr, idField = "id", callback) {
  let treeProps = {};
  let list = [];

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];
  let treeIndex = -1;

  for (let i = 0, len = treeList.length; i < len; i++) {
    const d = treeList[i];
    let k = d[idField];
    let index = i + 1;

    list.push(d);

    const childrens = d.children || [];

    treeIndex++;

    let nodeInfo = {
      depth: 0,
      index: i,
      treeIndex,
      orders: [index],
      parents: []
    };

    setTree(k, nodeInfo);

    if (childrens.length > 0) {
      getChildren(d, 0, [], [index]);
    }

    if (typeof callback === "function") {
      callback(d, nodeInfo);
    }
  }

  function getChildren(item, depth, parents, orders) {
    const childrens = item.children;
    const pk = item[idField];

    let __depth = depth + 1;

    let __parents = parents.slice();
    __parents.push(pk);

    let _childrensKeys = [];

    for (let i = 0, len = childrens.length; i < len; i++) {
      const d = childrens[i];
      const k = d[idField];

      const c_childrens = d.children || [];
      list.push(d);

      let __orders = orders.slice();
      __orders.push(i + 1);

      _childrensKeys.push(k);

      treeIndex++;

      let nodeInfo = {
        index: i,
        treeIndex,
        orders: __orders,
        depth: __depth,
        parents: __parents
      };

      setTree(k, nodeInfo);

      if (typeof callback === "function") {
        callback(d, nodeInfo);
      }

      let cArr = [];
      if (c_childrens.length > 0) {
        cArr = getChildren(d, __depth, __parents, __orders);
      }

      for (let j = 0; j < cArr.length; j++) {
        _childrensKeys.push(cArr[j]);
      }
    }

    setTree(pk, {
      childrens: _childrensKeys
    });

    return _childrensKeys;
  }

  return { list, treeProps: treeProps };
}
