const HEADER_HEIGHT = 40;

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

  return styles;
}

export function isNumber(v) {
  if (v === undefined || v === null || isNaN(v - 0)) {
    return false;
  }
  return true;
}

export function isFlexibleColumn(column) {
  let isFlexible = false;

  if (column) {
    if (!hasColumnWidth({ width: column.width })) {
      isFlexible = true;
    }
  }
  return isFlexible;
}

export function hasFlexibleColumn(arr) {
  let bl = false;

  let roots = arr || [];

  for (let i = 0; i < roots.length; i++) {
    const d = roots[i];
    if (!hasColumnWidth({ width: d.width })) {
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
      if (!hasColumnWidth({ width: d.width })) {
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

function getColumnWidth({ column, maxDepth = 0 }) {
  let columnWidth = 0;

  treeFilter([column], function(item, i, extra) {
    let hasChildren = false;

    let cw = getColumnWidthStyle(item).width;

    if (item.children && item.children.length > 0) {
      hasChildren = true;
    }

    if (extra.depth === maxDepth) {
      columnWidth = columnWidth + cw;
    } else {
      if (hasChildren === true) {
      } else {
        columnWidth = columnWidth + cw;
      }
    }

    return true;
  });

  return columnWidth;
}
export function getColumnHeight({ depth = 0, rowspan = 0, rowHeights = [] }) {
  let columnHeight = 0;

  let end = depth + rowspan;

  for (let i = depth; i < end; i++) {
    let h = rowHeights[i];
    if (!isNumber(h)) {
      h = HEADER_HEIGHT;
    }
    columnHeight = columnHeight + h;
  }

  return columnHeight;
}

export function getColumnsWidth({ columns, start, end, maxDepth }) {
  let columnsWidth = 0;

  for (let i = start; i < end; i++) {
    let d = columns[i];
    if (d) {
      let cw = getColumnWidth({
        column: d,
        maxDepth: maxDepth
      });
      columnsWidth = cw + columnsWidth;
    } else {
      break;
    }
  }
  return columnsWidth;
}
