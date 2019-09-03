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

export function treeToList(arr, idField = "id", withParentId = false) {
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

    d.__depth = 0;
    if (withParentId === true) {
      d["__parentKey"] = "";
    }

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

      if (withParentId === true) {
        d["__parentKey"] = item[idField];
      }

      d.__parents = [].concat(parents).concat([item[idField]]);

      list.push(d);

      if (childrens.length > 0) {
        getChildren(d, d.__depth, [].concat(d.__parents));
      } else {
        leafs.push(d);
      }
    }
  }

  return { list, leafs, roots };
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

    let bl = fn(d, i, 0, j);
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

      let bl = fn(d, i, depth + 1, j);

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

