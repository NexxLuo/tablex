const HEADER_HEIGHT = 40;

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

export function isNumber(v) {
  if (typeof v !== "number") {
    return false;
  }
  if (isNaN(v - 0)) {
    return false;
  } else {
    return true;
  }
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
          d.children = getChildren(d, depth + 1);
        }

        nextChildrens.push(d);
      }
    }

    return nextChildrens;
  }

  return roots;
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

  if (!hasColumnWidth({ width })) {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
    styles.width = minWidth || DEFAULT_COLUMN_WIDTH;
  } else {
    styles.width = width || minWidth || 0;
  }

  if (typeof styles.width === "number" && styles.width < 0) {
    styles.width = 0;
  }

  return styles;
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

export function getDepth(node, depth = 0) {
  if (!node.children) {
    return depth;
  }

  return node.children.reduce(
    (deepest, child) => Math.max(deepest, getDepth(child, depth + 1)),
    depth
  );
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

  let left = [],
    middle = [],
    right = [];

  let leftWidth = 0,
    rightWidth = 0,
    middleWidth = 0;

  function getChildren(item, type = "middle") {
    let childrens = [];

    let arr = item.children || [];

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      const children = d.children || [];

      let columnWidth = d.width || d.minWidth || DEFAULT_COLUMN_WIDTH;

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
            middleWidth += columnWidth;
          }
        } else {
          if (d.fixed === type) {
            childrens.push(d);
            if (type === "left") {
              leftWidth += columnWidth;
            } else if (type === "right") {
              rightWidth += columnWidth;
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

    let columnWidth = d.width || d.minWidth || DEFAULT_COLUMN_WIDTH;

    if (children.length > 0) {
      let leftChildrens = getChildren(d, "left");
      let middleChildrens = getChildren(d, "middle");
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
        leftWidth += columnWidth;
        arrayPush(left, d, keyField);
      } else if (d.fixed === "right") {
        rightWidth += columnWidth;
        arrayPush(right, d, keyField);
      } else {
        middleWidth += columnWidth;
        arrayPush(middle, d, keyField);
      }
    }
  }

  let prepend_depth = 0;
  if (prepend.length > 0) {
    let {
      middle: p_m,
      middleWidth: p_mw,
      left: p_l,
      leftWidth: p_lw,
      right: p_r,
      rightWidth: p_rw,
      maxDepth: p_d
    } = formatColumns(prepend, [], keyField);

    prepend_depth = p_d;
    right = p_r.concat(right);
    rightWidth = rightWidth + p_rw;

    if (left.length > 0) {
      left = p_l.concat(p_m).concat(left);
      leftWidth = leftWidth + p_mw + p_lw;
    } else {
      left = p_l.concat(left);
      leftWidth = leftWidth + p_lw;
      middle = p_m.concat(middle);
      middleWidth = middleWidth + p_mw;
    }
  }

  let maxDepth = getDepth({ children: columns });
  if (maxDepth > 0) {
    maxDepth = maxDepth - 1;
  }
  if (prepend_depth > maxDepth) {
    maxDepth = prepend_depth;
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
      //   return el;
    }

    let p = el.parentElement || el.parentNode;

    if (p) {
      if (isMatched(p, tagName)) {
        return p;
      } else {
        return getParent(p, tagName);
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

export function getTableHeight({
  rowHeight,
  autoHeight,
  maxHeight,
  minHeight,
  showHeader,
  headerRowHeight,
  data,
  columns,
  height
}) {
  let maxDepth = getDepth({ children: columns }, -1);

  //表头高度
  let headerHeight = 0;
  let headerHeights = [];

  if (showHeader === true) {
    for (let i = 0; i < maxDepth + 1; i++) {
      let h = headerRowHeight[i];
      if (!isNumber(h)) {
        h = HEADER_HEIGHT;
      }
      headerHeights.push(h);
      headerHeight = headerHeight + h;
    }
  }

  let tableHeight = height;
  let tableBodyMinHeight = 100;

  if (autoHeight === true || !tableHeight) {
    let rh = 40;
    if (typeof rowHeight === "number") {
      rh = rowHeight;
    }
    let totalRowsHeight = data.length * rh || tableBodyMinHeight;
    tableHeight = totalRowsHeight + headerHeight + 2;
  }

  if (tableHeight < minHeight) {
    tableHeight = minHeight;
  }

  if (tableHeight > maxHeight) {
    tableHeight = maxHeight;
  }

  return { tableHeight, headerHeights, headerHeight };
}
