
export function flatten(arr) {
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
  
      list.push(d);
      roots.push(d);
  
      if (childrens.length > 0) {
        getChildren(d, 0);
      } else {
        leafs.push(d);
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
      }
    }
  
    return { list, leafs, roots };
  }
  
  
  export function unflatten(arr = [], idField, pidField) {
  
    let tree = [];
  
    function getChildren(item) {
  
        let id = item[idField];
  
        let childrens = arr.filter(y => y[pidField] === id);
  
        for (let i = 0; i < childrens.length; i++) {
  
            let d = childrens[i];
            const nextId = d[idField];
  
            const nextChildrens = arr.filter(y => y[pidField] === nextId);
  
            if (nextChildrens.length > 0) {
                d.children = getChildren(d);
            }
  
        }
  
        return childrens;
  
    }
  
    let roots = arr.filter(d => !d[pidField]);
  
  
    for (let i = 0, len = roots.length; i < len; i++) {
  
        let d = Object.assign({}, roots[i]);
  
        d.children = getChildren(d);
  
        tree.push(d)
    }
  
    return tree;
  }
  
  