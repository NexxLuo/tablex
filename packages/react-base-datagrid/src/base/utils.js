export function getScrollbarWidth() {
  var userAgent = navigator.userAgent;

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

export function getFlattenColumns(arr, idField = "key") {
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

      const pk = item[idField];

      d.__depth = depth + 1;

      d.__parent = {
        title: item.title,
        key: pk,
        width: item.width
      };

      d.__parents = [].concat(parents).concat([pk]);

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

export function formatColumns(columns = [], prepend = [], keyField = "key") {
  let DEFAULT_COLUMN_WIDTH = 100;

  let arr = columns;

  function arrayPush(dest, item, primaryKey) {
    if (
      item &&
      dest.findIndex(p => p[primaryKey] === item[primaryKey]) === -1
    ) {
      dest.push(item);
    }
  }

  let leftDepth = 0,
    rightDepth = 0,
    middleDepth = 0;

  let left = [],
    middle = [],
    right = [];

  let leftWidth = 0,
    rightWidth = 0,
    middleWidth = 0;

  function getChildren(item, type = "middle") {
    let childrens = [];

    let arr = item.children || [];

    if (type === "middle") {
      middleDepth = middleDepth + 1;
    }
    if (type === "left") {
      leftDepth = leftDepth + 1;
    }
    if (type === "right") {
      rightDepth = rightDepth + 1;
    }

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      const children = d.children || [];

      if (children.length > 0) {
        let typeChildrens = getChildren(d, type);

        let temp = {};

        Object.keys(d).forEach(k => {
          if (k !== "children") {
            temp[k] = d[k];
          }
        });

        if (typeChildrens.length > 0) {
          temp.children = typeChildrens;
          childrens.push(temp);
        }
      } else {
        if (type === "middle") {
          if (d.fixed !== "left" && d.fixed !== "right") {
            childrens.push(d);
            middleWidth += d.width || DEFAULT_COLUMN_WIDTH;
          }
        } else {
          if (d.fixed === type) {
            childrens.push(d);
            if (type === "left") {
              leftWidth += d.width || DEFAULT_COLUMN_WIDTH;
            } else if (type === "right") {
              rightWidth += d.width || DEFAULT_COLUMN_WIDTH;
            }
          }
        }
      }
    }

    return childrens;
  }

  for (let i = 0; i < arr.length; i++) {
    const d = arr[i];
    const children = d.children || [];

    if (children.length > 0) {
      leftDepth = 0;
      let leftChildrens = getChildren(d, "left");
      middleDepth = 0;
      let middleChildrens = getChildren(d, "middle");
      rightDepth = 0;
      let rightChildrens = getChildren(d, "right");

      let temp = {};

      Object.keys(d).forEach(k => {
        if (k !== "children") {
          temp[k] = d[k];
        }
      });

      if (leftChildrens.length > 0) {
        arrayPush(
          left,
          Object.assign({}, temp, { children: leftChildrens }),
          keyField
        );
      }

      if (middleChildrens.length > 0) {
        arrayPush(
          middle,
          Object.assign({}, temp, { children: middleChildrens }),
          keyField
        );
      }

      if (rightChildrens.length > 0) {
        arrayPush(
          right,
          Object.assign({}, temp, { children: rightChildrens }),
          keyField
        );
      }
    } else {
      if (d.fixed === "left") {
        leftWidth += d.width || DEFAULT_COLUMN_WIDTH;
        arrayPush(left, d, keyField);
      } else if (d.fixed === "right") {
        rightWidth += d.width || DEFAULT_COLUMN_WIDTH;
        arrayPush(right, d, keyField);
      } else {
        middleWidth += d.width || DEFAULT_COLUMN_WIDTH;
        arrayPush(middle, d, keyField);
      }
    }
  }

  let maxDepth = Math.max.apply(null, [leftDepth, rightDepth, middleDepth]);

  let prependWidth = 0;

  prepend.forEach(d => {
    prependWidth += d.width || DEFAULT_COLUMN_WIDTH;
  });

  if (left.length > 0) {
    left = prepend.concat(left);
    leftWidth += prependWidth;
  } else {
    middle = prepend.concat(middle);
    middleWidth += prependWidth;
  }

  return {
    middle,
    middleWidth,
    left,
    leftWidth,
    right,
    rightWidth,
    maxDepth
  };
}

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

export function delegate(element, selector, types, fn) {
  if (!element) {
    return;
  }

  if (types === "mouseenter") {
    element["onmouseover"] = function(e) {
      let fromElement = e.relatedTarget;

      let el = e.target;

      if (el !== element) {
        let source = getParentElement(e.target, selector);

        let fromElementParent = getParentElement(fromElement, selector);

        if (source !== null && fromElementParent !== source) {
          fn(e, source);
        }
      }
    };
  } else if (types === "mouseleave") {
    element["onmouseout"] = function(e) {
      let toElement = e.relatedTarget;

      let el = e.target;

      if (el !== element) {
        let source = getParentElement(e.target, selector);
        let toElementParent = getParentElement(toElement, selector);

        if (source !== null && toElementParent !== source) {
          fn(e, source);
        }
      }
    };
  } else {
    element.addEventListener(types, function(e) {
      let el = e.target;

      if (el !== element) {
        let source = getParentElement(e.target, selector);

        if (source) {
          fn(e, source);
        }
      }
    });
  }
}

export function addClass(element, cls) {
  if (!element) {
    return;
  }

  let current = (element.className || "")
    .split(" ")
    .filter(d => d.replace(/(^\s*)|(\s*$)/g, "") !== "");
  let newCls = current;

  if (current.indexOf(cls) < 0) {
    newCls.push(cls);
    element.className = newCls.join(" ");
  }

  return element;
}

export function removeClass(element, cls) {
  if (!element) {
    return;
  }

  let current = (element.className || "")
    .split(" ")
    .filter(d => d.replace(/(^\s*)|(\s*$)/g, "") !== "");
  let newCls = current;

  let index = current.indexOf(cls);

  if (index > -1) {
    newCls.splice(index, 1);
    element.className = newCls.join(" ");
  }

  return element;
}

export function toggleClass(element, cls) {
  if (!element) {
    return;
  }

  let current = (element.className || "")
    .split(" ")
    .filter(d => d.replace(/(^\s*)|(\s*$)/g, "") !== "");
  let newCls = current;

  let index = current.indexOf(cls);

  if (index > -1) {
    newCls.splice(index, 1);
  } else {
    newCls.push(cls);
  }

  element.className = newCls.join(" ");

  return element;
}

function hasColumnWidth(o) {
  let bl = true;

  let w = parseInt(o.width);

  if (isNaN(w)) {
    bl = false;

    let mw = parseInt(o.minWidth);

    if (!isNaN(mw)) {
      bl = true;
    }
  }

  return bl;
}

export function getColumnWidthStyle({ width, minWidth }) {
  let styles = {};
  const DEFAULT_COLUMN_WIDTH = 100;

  if (!hasColumnWidth({ width, minWidth })) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
    styles.width = DEFAULT_COLUMN_WIDTH;
  } else {
    styles.width = width || minWidth;
  }

  return styles;
}

export function hasFlexibleColumn(arr) {
  let bl = false;

  let roots = arr || [];

  for (let i = 0; i < roots.length; i++) {
    const d = roots[i];
    if (!hasColumnWidth(d)) {
      bl = true;
      break;
    }
    const childrens = d.children || [];
    if (childrens.length > 0) {
      getChildren(d);
    }
  }

  function getChildren(item) {
    const tempArr = item.children || [];
    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];
      const childrens = d.children || [];
      if (!hasColumnWidth(d)) {
        bl = true;
        break;
      }
      if (childrens.length > 0) {
        getChildren(d);
      }
    }
  }

  return bl;
}
