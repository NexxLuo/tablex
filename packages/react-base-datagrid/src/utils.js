export function flatten(arr, removeChildren = false) {
  let treeList = arr || [];

  //末级节点
  let leafs = [];
  //根
  let roots = [];

  //所有节点
  let list = [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    const childrens = d.children || [];

    list.push(d);
    roots.push(d);

    if (childrens.length > 0) {
      getChildren(d, 0);
    } else {
      leafs.push(d);
    }

    if (removeChildren === true) {
      delete d.children;
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

      if (removeChildren === true) {
        delete d.children;
      }
    }
  }

  return { list, leafs, roots };
}

export function unflatten(flatData = [], idField, pidField) {
  let rootKey = "";
  function getKey(node) {
    return node[idField] || "";
  }

  function getParentKey(node) {
    return node[pidField] || "";
  }

  if (!flatData) {
    return [];
  }

  const childrenToParents = {};
  flatData.forEach(child => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = parent => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map(child => trav(child))
      };
    }

    return { ...parent };
  };

  return childrenToParents[rootKey].map(child => trav(child));
}
