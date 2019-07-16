export function getDataListWithExpanded(list, expandedKeys = [], rowKey) {
  let arr = [];

  for (let i = 0; i < list.length; i++) {
    let d = Object.assign({}, list[i]);

    d.__depth = 0;

    arr.push(d);

    if (expandedKeys.indexOf(d[rowKey]) > -1) {
      if (d.children) {
        setChildren(d, 0, []);
      }
    }
  }

  function setChildren(c, depth, parents) {
    let cArr = c.children;
    for (let i = 0; i < cArr.length; i++) {
      let d = Object.assign({}, cArr[i]);
      d.__depth = depth + 1;
      d.__parents = [].concat(parents).concat([c[rowKey]]);
      arr.push(d);

      if (expandedKeys.indexOf(d[rowKey]) > -1) {
        if (d.children) {
          setChildren(d, d.__depth, [].concat(d.__parents));
        }
      }
    }
  }

  return arr;
}

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
    const d = Object.assign({}, treeList[i]);

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
      const d = Object.assign({}, tempArr[i]);

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
