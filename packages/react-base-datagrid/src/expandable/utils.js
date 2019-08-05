export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let treeProps = {};
  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let arr = [];

  for (let i = 0, len = list.length; i < len; i++) {
    let d = list[i];
    let k = d[rowKey];
    let index = i + 1;

    setTree(k, { depth: 0, orders: [index] });

    arr.push(d);

    if (expandedKeys.indexOf(d[rowKey]) > -1) {
      if (d.children) {
        setChildren(d, 0, [], [index]);
      }
    }
  }

  function setChildren(c, depth, parents, orders) {
    let cArr = c.children;
    const pk = c[rowKey];

    for (let i = 0; i < cArr.length; i++) {
      let d = cArr[i];
      let k = d[rowKey];
      let index = i + 1;

      parents.push(pk);
      orders.push(index);

      let __depth = depth + 1;
      let __parents = parents;
      let __orders = orders;

      setTree(k, {
        orders: __orders,
        depth: __depth,
        parents: __parents
      });

      arr.push(d);

      if (expandedKeys.indexOf(d[rowKey]) > -1) {
        if (d.children) {
          setChildren(d, __depth, __parents, __orders);
        }
      }
    }
  }

  return { data: arr, treeProps };
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

    for (let i = 0, len = childrens.length; i < len; i++) {
      const d = childrens[i];
      const k = d[idField];
      let index = i + 1;

      const c_childrens = d.children || [];
      list.push(d);
      parents.push(pk);
      orders.push(index);

      let __depth = depth + 1;
      let __parents = parents;
      let __orders = orders;

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

  return { list, treeProps };
}
