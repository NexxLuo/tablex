export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let treeProps = {};
  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let arr = [];

  for (let i = 0; i < list.length; i++) {
    let d = list[i];
    let k = d[rowKey];

    setTree(k, { depth: 0 });

    arr.push(d);

    if (expandedKeys.indexOf(d[rowKey]) > -1) {
      if (d.children) {
        setChildren(d, 0, []);
      }
    }
  }

  function setChildren(c, depth, parents) {
    let cArr = c.children;
    const pk = c[rowKey];

    for (let i = 0; i < cArr.length; i++) {
      let d = cArr[i];
      let k = d[rowKey];

      let __depth = depth + 1;
      let __parents = [].concat(parents).concat([pk]);

      setTree(k, {
        depth: __depth,
        parents: __parents
      });

      arr.push(d);

      if (expandedKeys.indexOf(d[rowKey]) > -1) {
        if (d.children) {
          setChildren(d, __depth, __parents);
        }
      }
    }
  }

  return { data: arr, treeProps };
}

export function treeToList(arr, idField = "id") {
  let treeProps = {};

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];

  //末级节点
  let leafs = [];

  //根
  let roots = [];

  //所有节点
  let list = [];

  for (let i = 0; i < treeList.length; i++) {
    //  const d = Object.assign({}, treeList[i]);
    const d = treeList[i];
    let k = d[idField];

    if (!d) {
      continue;
    }

    const childrens = d.children || [];

    setTree(k, { depth: 0 });

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
    const pk = item[idField];

    for (let i = 0; i < tempArr.length; i++) {
      //const d = Object.assign({}, tempArr[i]);
      const d = tempArr[i];
      const k = d[idField];

      const childrens = d.children || [];

      let __depth = depth + 1;
      let __parents = [].concat(parents).concat([pk]);

      setTree(k, {
        depth: __depth,
        parents: __parents
      });

      // d.__depth = depth + 1;
      // d.__parent = {
      //   title: item.title,
      //   key: item[idField],
      //   width: item.width
      // };

      // d.__parents = [].concat(parents).concat([pk]);

      list.push(d);

      if (childrens.length > 0) {
        getChildren(d, __depth, __parents);
      } else {
        leafs.push(d);
      }
    }
  }

  return { list, leafs, roots, treeProps: treeProps };
}

export function getTreeProps(arr, idField = "id") {
  let treeProps = {};

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];
    let k = d[idField];

    if (!d) {
      continue;
    }

    const childrens = d.children || [];

    setTree(k, { depth: 0 });

    if (childrens.length > 0) {
      getChildren(d, 0, []);
    }
  }

  function getChildren(item, depth, parents) {
    const tempArr = item.children || [];
    const pk = item[idField];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const k = d[idField];

      const childrens = d.children || [];

      let __depth = depth + 1;
      let __parents = [].concat(parents).concat([pk]);

      setTree(k, {
        depth: __depth,
        parents: __parents
      });

      if (childrens.length > 0) {
        getChildren(d, __depth, __parents);
      }
    }
  }

  return treeProps;
}
