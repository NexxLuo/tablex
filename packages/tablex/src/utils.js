export function getParentElement(element, selector) {
  function isMatched(el, str = "") {
    str = str.toLowerCase();

    let matched = false;

    let firstChar = str.split("")[0];

    if (firstChar === ".") {
      let selectorClass = str.split(".")[1] || "";
      let elCls = el.className || "";
      if (typeof elCls === "string") {
        let cls = elCls.toLowerCase().split(" ");
        matched = cls.indexOf(selectorClass) > -1;
      } else {
        // 某些元素的className并不是string类型，比如：svg
        // console.log("className:", el.classList);
      }
    } else if (firstChar === "#") {
      let selectorID = str.split("#")[1] || "";
      let elID = el.id || "";
      if (typeof elID === "string") {
        matched = elID.toLowerCase() === selectorID;
      }
    } else {
      matched = el.tagName.toLowerCase() === str;
    }

    return matched;
  }

  function getParent(el, tagName) {
    if (!el) {
      return null;
    }

    if (isMatched(el, tagName)) {
      return el;
    }

    let p = el.parentElement;

    if (p !== null) {
      if (isMatched(p, tagName)) {
        return p;
      } else {
        return getParent(el.parentElement, tagName);
      }
    } else {
      return null;
    }
  }

  return getParent(element, selector);
}

export function treeToList(arr, idField = "id") {
  let treeProps = {};
  let list = [];

  function setTree(key, prop) {
    let p = treeProps[key] || {};
    treeProps[key] = Object.assign(p, prop);
  }

  let treeList = arr || [];

  for (let i = 0, len = treeList.length; i < len; i++) {
    const d = treeList[i];
    let k = d[idField];

    list.push(d);

    const childrens = d.children || [];

    if (childrens.length > 0) {
      getChildren(d, 0);
    }

    setTree(k, {
      depth: 0,
      parentKey: ""
    });
  }

  function getChildren(item, depth) {
    const childrens = item.children;
    const pk = item[idField];

    let __depth = depth + 1;

    for (let i = 0, len = childrens.length; i < len; i++) {
      const d = childrens[i];
      const k = d[idField];

      const c_childrens = d.children || [];
      list.push(d);

      if (c_childrens.length > 0) {
        getChildren(d, __depth);
      }

      setTree(k, {
        depth: __depth,
        parentKey: pk
      });
    }
  }

  return { list, treeProps: treeProps };
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

    const childrens = d.children || [];

    list.push(d);
    roots.push(d);

    if (childrens.length > 0) {
      getChildren(d, 0);
    } else {
      leafs.push(d);
    }
  }

  function getChildren(item) {
    const tempArr = item.children || [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const childrens = d.children || [];

      list.push(d);

      if (childrens.length > 0) {
        getChildren(d);
      } else {
        leafs.push(d);
      }
    }
  }

  return { list, leafs, roots };
}

export function treeFilter(arr, fn) {
  let treeList = arr || [];

  //根
  let roots = [];
  let j = 0;

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    let bl = fn(d, i, { depth: 0, treeIndex: j, parent: null });
    j++;

    if (bl === true) {
      if (d.children && d.children.length > 0) {
        d.children = getChildren(d, 0);
      }

      roots.push(d);
    }
  }

  function getChildren(node, depth) {
    const tempArr = node.children || [];

    const nextChildrens = [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];

      let bl = fn(d, i, { depth: depth + 1, treeIndex: j, parent: node });

      j++;

      if (bl === true) {
        if (d.children && d.children.length > 0) {
          d.children = getChildren(d, i, depth + 1);
        }

        nextChildrens.push(d);
      }
    }

    return nextChildrens;
  }

  return roots;
}

export function getTreeFromFlatData({
  flatData,
  getKey = node => node.id,
  getParentKey = node => node.parentId,
  rootKey = "0"
}) {
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

export function cloneData(source) {
  try {
    return JSON.parse(JSON.stringify(source));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function deleteData(data, keys, rowKey) {
  let { list, treeProps } = treeToList(data, rowKey);
  let flatData = list.slice();

  let newFlatData = [];

  let deletedRows = [];
  let deletedRowKeys = [];

  let keysMap = {};

  for (let i = 0; i < keys.length; i++) {
    keysMap[keys[i]] = true;
  }

  for (let i = 0; i < flatData.length; i++) {
    let d = flatData[i];
    if (d) {
      let k = d[rowKey];
      if (k in keysMap) {
        deletedRowKeys.push(k);
        deletedRows.push(Object.assign({}, d));
      } else {
        delete d.children;
        newFlatData.push(d);
      }
    }
  }

  //此处改变了数据引用
  let newData = getTreeFromFlatData({
    flatData: newFlatData,
    getKey: node => node[rowKey],
    getParentKey: node => {
      let p = treeProps[node[rowKey]] || {};
      return p.parentKey || "";
    },
    rootKey: ""
  });
  //

  //此处，保证返回的数据均属于同一个引用
  let newDataToFlat = [];

  treeFilter(newData, function(d) {
    newDataToFlat.push(d);
    return true;
  });
  //

  return {
    newData,
    newFlatData: newDataToFlat,
    deletedRows,
    deletedRowKeys
  };
}

export function insertData({
  source,
  data,
  prepend,
  parentKey,
  rowKey,
  startIndex
}) {
  let insertRows = data;
  let insertRowKeys = [];
  let insertRowsKeyMap = {};
  let insertTreeProps = {};

  for (let i = 0; i < insertRows.length; i++) {
    let d = insertRows[i];
    let k = d[rowKey];

    insertRowKeys.push(k);
    insertRowsKeyMap[k] = true;
    insertTreeProps[k] = {
      parentKey: parentKey
    };
  }

  if (!parentKey) {
    let o = {
      insertedRowKeys: insertRowKeys,
      insertedRows: insertRows
    };

    if (startIndex > -1) {
      let newData = source.slice();
      let newFlatData = source.slice();

      Array.prototype.splice.apply(newData, [startIndex, 0, ...insertRows]);
      Array.prototype.splice.apply(newFlatData, [startIndex, 0, ...insertRows]);

      o.newData = newData;
      o.newFlatData = newFlatData;
    } else {
      if (prepend === true) {
        o.newData = insertRows.slice().concat(source);
        o.newFlatData = insertRows.slice().concat(source);
      } else {
        o.newData = source.slice().concat(insertRows);
        o.newFlatData = source.slice().concat(insertRows);
      }
    }

    return o;
  }

  let { list, treeProps } = treeToList(source, rowKey);
  let flatData = list.slice();

  treeProps = Object.assign(treeProps, insertTreeProps);

  let newFlatData = [];

  if (prepend === true) {
    newFlatData = insertRows.slice().concat(flatData);
  } else {
    newFlatData = flatData.concat(insertRows);
  }

  //此处改变了数据引用
  let newData = getTreeFromFlatData({
    flatData: newFlatData,
    getKey: node => node[rowKey],
    getParentKey: node => {
      let p = treeProps[node[rowKey]] || {};
      return p.parentKey || "";
    },
    rootKey: ""
  });
  //

  //此处，保证返回的数据均属于同一个引用
  let newDataToFlat = [];
  let newDataInserted = [];
  let newDataInsertedKeys = [];

  treeFilter(newData, function(d) {
    newDataToFlat.push(d);
    let k = d[rowKey];
    if (insertRowsKeyMap[k] === true) {
      newDataInserted.push(d);
      newDataInsertedKeys.push(k);
    }
    return true;
  });
  //

  return {
    newData,
    newFlatData: newDataToFlat,
    insertedRowKeys: newDataInsertedKeys,
    insertedRows: newDataInserted
  };
}
