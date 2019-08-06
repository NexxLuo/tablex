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
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);

  let parentKeys = getParents(key, treeProps);

  console.log("removeCheckedKey:",treeProps[key])

  //父级半选的key
  let parentHalfCheckedKeys = [];

  //子级key
  let childrenKeys = getChildrens(key, treeProps);

  //移除子级
  if (childrenKeys.length > 0) {
    for (let i = 0; i < childrenKeys.length; i++) {
      const k = childrenKeys[i];

      //移除选中
      let j = nextKeys.findIndex(d => d === k);
      if (j > -1) {
        nextKeys.splice(j, 1);
      }

      //移除半选
      let m = nextHalfCheckedKeys.findIndex(d => d === k);
      if (m > -1) {
        nextHalfCheckedKeys.splice(m, 1);
      }
    }
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

        //取消选中父级
        let j = nextKeys.findIndex(d => d === p);
        if (j > -1) {
          nextKeys.splice(j, 1);
        }
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
  rowKey,
  flatData,
  halfCheckedKeys,
  disabledSelectKeys = []
}) {
  let nextKeys = [].concat(selectedRowKeys);
  let nextHalfCheckedKeys = [].concat(halfCheckedKeys);

  let parentKeys = getParents(key, treeProps);

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

  if (selectedRowKeys.indexOf(key) === -1) {
    let halfIndex = nextHalfCheckedKeys.indexOf(key);
    if (halfIndex > -1) {
      nextHalfCheckedKeys.splice(halfIndex, 1);
    }

    nextKeys.push(key);
  }

  //父级半选的key
  let parentHalfCheckedKeys = [];

  //子级key
  let childrenSelectedKeys = [];

  flatData.filter(d => {
    let ck = d[rowKey];
    let pArr = getParents(ck, treeProps);
    let bl = pArr.indexOf(key) > -1;
    if (bl) {
      if (selectedRowKeys.indexOf(ck) === -1) {
        //子级是否允许被选择
        let isEnableSelect = isEnabled(ck);

        for (let i = 0; i < pArr.length; i++) {
          const cpk = pArr[i];
          if (isEnabled(cpk) === false) {
            isEnableSelect = false;
            break;
          }
        }

        isEnableSelect && childrenSelectedKeys.push(ck);
      }
    }
    return bl;
  });

  nextKeys = nextKeys.concat(childrenSelectedKeys);

  for (let i = parentKeys.length - 1; i >= 0; i--) {
    let p = parentKeys[i];

    let pNode = flatData.find(d => {
      return d[rowKey] === p;
    });

    let childrens = [];
    if (pNode) {
      childrens = pNode.children || [];
    }

    //子级是否全被选中
    let childrensAllChecked = true;

    for (let i = 0; i < childrens.length; i++) {
      const cKey = childrens[i][rowKey];
      if (isEnabled(cKey) && nextKeys.indexOf(cKey) === -1) {
        childrensAllChecked = false;
        break;
      }
    }

    //子级全被选中，则勾选其父节点
    if (childrensAllChecked === true) {
      if (nextKeys.indexOf(p) === -1) {
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

  let newHalflCheckedKeys = nextHalfCheckedKeys.concat(parentHalfCheckedKeys);

  return {
    selectedRowKeys: nextKeys,
    halfCheckedKeys: newHalflCheckedKeys
  };
}
