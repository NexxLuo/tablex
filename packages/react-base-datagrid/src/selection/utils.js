function getParents(key, treeProps) {
  let p = (treeProps || {})[key] || {};
  let keys = p.parents || [];
  return keys;
}

function getChildrens(key, treeProps) {
  let p = (treeProps || {})[key] || {};
  let keys = p.childrens || [];
  return keys;
}

function testTime(v) {
  if (v) {
    return (new Date().getTime() - v) / 1000;
  }

  return new Date();
}

/**
 * 添加选中行
 * @key {Array} 行key
 * @treeProps {Object} 对应的树形数据属性
 * @selectedRowKeys {Array} 当前选中的行key
 * @rowKey {string} 数据行主键key字段名
 * @flatData {Array} 展平的表格数据
 * @halfCheckedKeys {Array} 当前半选状态的行key
 */
export function removeCheckedKey({
  key,
  treeProps,
  selectedRowKeys,
  halfCheckedKeys
}) {
  let nextKeys = selectedRowKeys.slice();
  let nextHalfCheckedKeys = halfCheckedKeys.slice();

  //父级key
  let parentKeys = getParents(key, treeProps);

  //子级key
  let childrenKeys = getChildrens(key, treeProps);

  //移除子级
  if (childrenKeys.length > 0) {
    let childrenKeysMap = {};

    for (let i = 0; i < childrenKeys.length; i++) {
      childrenKeysMap[childrenKeys[i]] = true;
    }

    let new_nextKeys = [];
    let new_nextHalfCheckedKeys = [];

    //移除选中
    for (let i = 0; i < selectedRowKeys.length; i++) {
      let sk = selectedRowKeys[i];

      if (childrenKeysMap[sk] !== true) {
        new_nextKeys.push(sk);
      }
    }

    //移除半选
    for (let i = 0; i < halfCheckedKeys.length; i++) {
      let sk = halfCheckedKeys[i];

      if (childrenKeysMap[sk] !== true) {
        new_nextHalfCheckedKeys.push(sk);
      }
    }

    nextKeys = new_nextKeys;
    nextHalfCheckedKeys = new_nextHalfCheckedKeys;
  }

  //移除本级选中
  let i = nextKeys.findIndex(d => d === key);
  if (i > -1) {
    nextKeys.splice(i, 1);
  }

  //移除本级半选
  let j = nextHalfCheckedKeys.findIndex(d => d === key);
  if (j > -1) {
    nextHalfCheckedKeys.splice(j, 1);
  }

  //父级半选的key
  let parentHalfCheckedKeys = [];

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];
    let childrens = getChildrens(p, treeProps);

    //子级是否全未选中
    let childrensAllUnChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i];
      if (nextKeys.indexOf(cKey) > -1) {
        childrensAllUnChecked = false;
        break;
      }
    }

    //子级全未选中，则取消勾选其父节点
    if (childrensAllUnChecked === true) {
      //取消选中父级
      let j = nextKeys.findIndex(d => d === p);
      if (j > -1) {
        nextKeys.splice(j, 1);
      }

      //取消半选父级
      let k = nextHalfCheckedKeys.findIndex(d => d === p);
      if (k > -1) {
        nextHalfCheckedKeys.splice(k, 1);
      }
    } else {
      //否则半选父节点
      if (halfCheckedKeys.indexOf(p) === -1) {
        parentHalfCheckedKeys.push(p);
      }

      //取消选中父级
      let j = nextKeys.findIndex(d => d === p);
      if (j > -1) {
        nextKeys.splice(j, 1);
      }
    }
  }

  let newHalflCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);

  return {
    selectedRowKeys: nextKeys,
    halfCheckedKeys: newHalflCheckedKeys
  };
}

/**
 * 添加选中行
 * @key {Array} 行key
 * @treeProps {Object} 对应的树形数据属性
 * @selectedRowKeys {Array} 当前选中的行key
 * @rowKey {string} 数据行主键key字段名
 * @flatData {Array} 展平的表格数据
 * @halfCheckedKeys {Array} 当前半选状态的行key
 * @disabledSelectKeys {Array} 禁用选择的数据行key
 */
export function addCheckedKeyWithDisabled({
  key,
  treeProps,
  selectedRowKeys,
  halfCheckedKeys,
  disabledSelectKeys = []
}) {
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);

  let parentKeys = getParents(key, treeProps);
  let childrenKeys = getChildrens(key, treeProps);

  /** 是否允许被选择 */
  function isEnabled(itemKey) {
    return disabledSelectKeys.indexOf(itemKey) === -1;
  }

  //本级是否允许选择
  if (isEnabled(key) === false) {
    return {
      selectedRowKeys,
      halfCheckedKeys
    };
  }

  //父级是否允许选择
  let parentEnableSelect = true;
  for (let i = 0; i < parentKeys.length; i++) {
    const pk = parentKeys[i];
    if (isEnabled(pk) === false) {
      parentEnableSelect = false;
      break;
    }
  }

  if (parentEnableSelect === false) {
    return {
      selectedRowKeys,
      halfCheckedKeys
    };
  }

  let selectedRowKeysMap = {};

  for (let i = 0; i < selectedRowKeys.length; i++) {
    selectedRowKeysMap[selectedRowKeys[i]] = true;
  }

  //选中本级
  if (selectedRowKeysMap[key] !== true) {
    let halfIndex = nextHalfCheckedKeys.indexOf(key);
    if (halfIndex > -1) {
      nextHalfCheckedKeys.splice(halfIndex, 1);
    }

    selectedRowKeysMap[key] = true;
    nextKeys.push(key);
  }

  //选中子级
  let childrenSelectedKeys = [];

  for (let i = 0; i < childrenKeys.length; i++) {
    let ck = childrenKeys[i];
    if (selectedRowKeysMap[ck] !== true) {
      //子级是否允许被选择
      let isEnableSelect = isEnabled(ck);

      let pArr = getParents(ck, treeProps);

      for (let i = 0; i < pArr.length; i++) {
        const cpk = pArr[i];
        if (isEnabled(cpk) === false) {
          isEnableSelect = false;
          break;
        }
      }

      if (isEnableSelect) {
        childrenSelectedKeys.push(ck);
        selectedRowKeysMap[ck] = true;
      }
    }
  }

  nextKeys = nextKeys.concat(childrenSelectedKeys);

  //半选父级
  let parentHalfCheckedKeys = [];

  //选中父级
  let parentCheckedKeys = [];

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];

    let childrens = getChildrens(p, treeProps);

    //子级是否全被选中
    let childrensAllChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i];
      if (isEnabled(cKey) && selectedRowKeysMap[cKey] !== true) {
        childrensAllChecked = false;
        break;
      }
    }

    //子级全被选中，则勾选其父节点
    if (childrensAllChecked === true) {
      if (selectedRowKeysMap[p] !== true) {
        isEnabled(p) && nextKeys.push(p);
      }

      //取消半选中父级
      let k = nextHalfCheckedKeys.findIndex(d => d === p);
      if (k > -1) {
        nextHalfCheckedKeys.splice(k, 1);
      }
    } else {
      //未全选，则半选父节点
      if (halfCheckedKeys.indexOf(p) === -1) {
        isEnabled(p) && parentHalfCheckedKeys.push(p);

        //取消选中父级
        let j = nextKeys.findIndex(d => d === p);
        if (j > -1) {
          nextKeys.splice(j, 1);
        }
      }
    }
  }

  let newHalfCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);
  let newCheckedKeys = nextKeys.concat(parentCheckedKeys);

  return {
    selectedRowKeys: newCheckedKeys,
    halfCheckedKeys: newHalfCheckedKeys
  };
}

/**
 * 根据key键值去重数据，重复项只保留第一条数据
 * @param {*} data
 * @param {*} key
 */
export function distinctData(data = [], key = "") {
  let keyMap = {};

  let arr = [];
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let rk = d[key];
    let isExist = keyMap[rk] === true;

    if (!isExist) {
      keyMap[rk] = true;
      arr.push(d);
    }
  }

  return arr;
}

/**
 * 根据key键值删除数据
 * @param {*} data
 * @param {*} keyField
 * @param {*} keys
 */
export function removeData(data = [], keyField = "", keys = []) {
  let keyMap = {};

  keys.forEach(k => {
    keyMap[k] = true;
  });

  let arr = [];

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let rk = d[keyField];
    let shouldRemoved = keyMap[rk] === true;

    if (!shouldRemoved) {
      arr.push(d);
    }
  }

  return arr;
}

/**
 * 根据key键值匹配数据
 * @param {*} data
 * @param {*} keyField
 * @param {*} keys
 */
export function filterDataByKeys(data = [], keyField = "", keys = []) {
  let nextKeys = [];
  let nextData = [];

  let keyMap = {};

  keys.forEach(k => {
    keyMap[k] = true;
  });

  let existsKeyMap = {};

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let rk = d[keyField];
    let matched = keyMap[rk] === true;
    let isExist = existsKeyMap[rk] === true;

    if (!isExist && matched) {
      existsKeyMap[rk] = true;
      nextKeys.push(rk);
      nextData.push(d);
    }
  }

  return { data: nextData, keys: nextKeys };
}

/**
 * 根据数据删除keys键值
 * @param {*} keys
 * @param {*} keyField
 * @param {*} data
 */

export function removeKeysByData(keys = [], keyField = "", data = []) {
  let dataMap = {};

  for (let i = 0; i < data.length; i++) {
    const k = data[i][keyField];
    dataMap[k] = true;
  }

  let existsKeyMap = {};

  let arr = [];
  for (let i = 0; i < keys.length; i++) {
    const rk = keys[i];
    let matched = dataMap[rk] === true;

    let isExist = existsKeyMap[rk] === true;

    if (!isExist && !matched) {
      existsKeyMap[rk] = true;
      arr.push(rk);
    }
  }

  return arr;
}

export function getSelectionChanged({
  keyField,
  selectedRowKeys,
  selectedRows,
  data,
  triggerKeys,
  selected
}) {
  let selectedKeyMap = {};

  selectedRowKeys.forEach(k => {
    selectedKeyMap[k] = true;
  });

  let dataMap = {};
  data.forEach(d => {
    dataMap[d[keyField]] = d;
  });

  let changedKeys = [];
  let changedRows = [];

  if (selected === true) {
    for (let i = 0; i < triggerKeys.length; i++) {
      const k = triggerKeys[i];
      let isExist = selectedKeyMap[k] === true;
      if (!isExist) {
        changedKeys.push(k);
        let d = dataMap[k];
        if (d) {
          changedRows.push(d);
        }
      }
    }
  } else {
    for (let i = 0; i < triggerKeys.length; i++) {
      const k = triggerKeys[i];
      let isExist = selectedKeyMap[k] === true;
      if (isExist) {
        changedKeys.push(k);
        let d = dataMap[k];
        if (d) {
          changedRows.push(d);
        }
      }
    }
  }

  return { changedKeys, changedRows };
}

export function getRowSelectionFromProps(props, k) {
  let o = props.rowSelection;

  let rowSelection = {};
  let defaultRowSelection = {
    showCheckbox: props.selectMode === "multiple",
    selectOnCheck: true,
    checkOnSelect: true
  };

  if (o instanceof Object) {
    rowSelection = Object.assign({}, defaultRowSelection, o);
  } else {
    rowSelection = defaultRowSelection;
  }

  if (k) {
    return rowSelection[k];
  } else {
    return rowSelection;
  }
}

export function getSelectionConfigFromProps(props) {
  let selectionColumn = null;
  let selectionProps = {};

  let { selectMode, selectionColumn: c } = props;

  if (props.rowSelection instanceof Object) {
    let rowSelection = getRowSelectionFromProps(props);

    let { type, columnWidth, columnTitle, fixed, showCheckbox } = rowSelection;

    let showSelectioColumn = false;

    if (type === "checkbox") {
      showSelectioColumn = true;
    }

    if (typeof showCheckbox === "boolean") {
      showSelectioColumn = showCheckbox;
    }

    if (showSelectioColumn === true) {
      let defaultSelectionColumn = {
        key: "__checkbox_column",
        dataIndex: "__checkbox_column",
        __type: "__checkbox_column",
        resizable: false,
        width: 50,
        align: "center"
      };

      selectionColumn = defaultSelectionColumn;

      let resetSelectionColumn = {};

      if ("columnWidth" in rowSelection) {
        resetSelectionColumn.width = columnWidth;
      }

      if ("columnTitle" in rowSelection) {
        resetSelectionColumn.title = columnTitle;
      }

      if (fixed === true) {
        resetSelectionColumn.fixed = "left";
      }

      selectionColumn = Object.assign(
        {},
        defaultSelectionColumn,
        resetSelectionColumn
      );
    }

    if ("selectedRowKeys" in rowSelection) {
      selectionProps.selectedRowKeys = rowSelection.selectedRowKeys;
    }
  } else {
    if (selectMode === "multiple") {
      let defaultSelectionColumn = {
        key: "__checkbox_column",
        dataIndex: "__checkbox_column",
        __type: "__checkbox_column",
        resizable: false,
        width: 50,
        align: "center"
      };

      selectionColumn = defaultSelectionColumn;

      if (c !== false && c !== null) {
        if (c instanceof Object) {
          selectionColumn = Object.assign({}, defaultSelectionColumn, c);
        }
      }
    }

    if ("selectedRowKeys" in props) {
      selectionProps.selectedRowKeys = props.selectedRowKeys;
    }

    if ("halfCheckedKeys" in props) {
      selectionProps.halfCheckedKeys = props.halfCheckedKeys;
    }

    if ("disabledSelectKeys" in props) {
      selectionProps.disabledSelectKeys = props.disabledSelectKeys;
    }
  }

  return { selectionProps, selectionColumn };
}
