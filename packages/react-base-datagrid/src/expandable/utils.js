export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let arr = [];

  for (let i = 0, len = list.length; i < len; i++) {
    let d = list[i];
    let index = i + 1;

    arr.push(d);

    if (expandedKeys.indexOf(d[rowKey]) > -1) {
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
      if (expandedKeys.indexOf(d[rowKey]) > -1) {
        if (d.children) {
          setChildren(d);
        }
      }
    }
  }

  return { data: arr };
}

export function getTreeProps(arr, idField = "id") {
  let treeProps = {};
  let list = [];

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];
    let k = d[idField];
    let index = i + 1;

    list.push(d);

    const childrens = d.children || [];

    setTree(k, { depth: 0, orders: [index] });

    if (childrens.length > 0) {
      getChildren(d, 0, [], [index]);
    }
  }

  function getChildren(item, depth, parents, orders) {
    const childrens = item.children;
    const pk = item[idField];

    let __depth = depth + 1;

    let __parents = parents.slice();
    __parents.push(pk);

    for (let i = 0, len = childrens.length; i < len; i++) {
      const d = childrens[i];
      const k = d[idField];

      const c_childrens = d.children || [];
      list.push(d);

      let __orders = orders.slice();
      __orders.push(i + 1);

      setTree(k, {
        orders: __orders,
        depth: __depth,
        parents: __parents
      });

      if (c_childrens.length > 0) {
        getChildren(d, __depth, __parents, __orders);
      }
    }
  }

  return { list, treeProps: treeProps };
}
