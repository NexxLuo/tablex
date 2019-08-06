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

export function getTreeProps(arr, idField = "id") {
  let bt = new Date();

  let treeProps = {};
  let list = [];

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];

  let _childrensKeys = [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];
    let k = d[idField];
    let index = i + 1;

    list.push(d);

    const childrens = d.children || [];

    let _childrens = [];
    _childrensKeys = [];

    if (childrens.length > 0) {
      _childrens = getChildren(d, 0, [], [index], _childrensKeys);
    }

    setTree(k, {
      depth: 0,
      orders: [index],
      parents: [],
      childrens: _childrensKeys
    });
  }

  function getChildren(item, depth, parents, orders, childrenKeys) {
    const childrens = item.children;
    const pk = item[idField];

    let __depth = depth + 1;

    let __parents = parents.slice();
    __parents.push(pk);

    let _childrensKeys = childrenKeys;

    for (let i = 0, len = childrens.length; i < len; i++) {
      const d = childrens[i];
      const k = d[idField];

      const c_childrens = d.children || [];
      list.push(d);

      let __orders = orders.slice();
      __orders.push(i + 1);


      _childrensKeys.push(k);


      if (c_childrens.length > 0) {
        getChildren(d, __depth, __parents, __orders, _childrensKeys);
      }


      setTree(k, {
        orders: __orders,
        depth: __depth,
        parents: __parents,
        childrens: _childrensKeys
      });

      //_childrens=[];
    }

    return _childrensKeys;
  }

  let et = new Date();

  console.log(
    "getTreeProps:",
    (et.getTime() - bt.getTime()) / 1000,
    Object.keys(treeProps).length
  );

  return { list, treeProps: treeProps };
}
