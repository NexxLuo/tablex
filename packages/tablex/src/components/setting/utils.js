function getTime() {
  let cd = new Date();

  let y = cd.getFullYear();
  let m = cd.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = cd.getDate();
  d = d < 10 ? "0" + d : d;
  let h = cd.getHours();
  h = h < 10 ? "0" + h : h;
  let mi = cd.getMinutes();
  mi = mi < 10 ? "0" + mi : mi;
  let s = cd.getSeconds();
  s = s < 10 ? "0" + s : s;

  return y + "/" + m + "/" + d + " " + h + ":" + mi + ":" + s;
}

let storageKey = "__tablex_configs";
let tableKey = "tableId";
let serverSaveFunctionName = "__tablex_configs_save";

let LocalConfig = {
  get: function(key) {
    let allConfigs = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );
    if (key) {
      let config = allConfigs.find(d => d[tableKey] === key);
      let settings = {};
      if (config) {
        if (typeof config === "string") {
          settings = JSON.parse(config);
        } else {
          settings = config;
        }
      }
      return settings;
    }
    return allConfigs;
  },

  set: function(key, configs) {
    configs = Object.assign(configs, {
      time: getTime(),
      [tableKey]: key
    });

    let allConfigs = LocalConfig.get();
    let i = allConfigs.findIndex(d => d[tableKey] === key);

    if (i > -1) {
      allConfigs[i] = Object.assign(allConfigs[i], configs);
    } else {
      allConfigs.push(configs);
    }
    window.localStorage.setItem(storageKey, JSON.stringify(allConfigs));
    return configs;
  },
  remove: function(key) {
    let allConfigs = LocalConfig.get();
    let i = allConfigs.findIndex(d => d[tableKey] === key);
    if (i > -1) {
      allConfigs.splice(i, 1);
      window.localStorage.setItem(storageKey, JSON.stringify(allConfigs));
    }
  }
};

export function getConfigs(key) {
  return LocalConfig.get(key);
}

export function setConfigs(key, configs) {
  return LocalConfig.set(key, configs);
}

//配置窗口 保存
export function saveConfigs(key, configs) {
  let settedConfigs = LocalConfig.set(key, configs);

  let serverSaveFn = window[serverSaveFunctionName];

  return new Promise(function(resolve, reject) {
    if (typeof serverSaveFn === "function") {
      serverSaveFn(key, settedConfigs).then(d => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

//配置窗口 重置
export function removeConfigs(key) {
  let serverSaveFn = window[serverSaveFunctionName];

  return new Promise(function(resolve, reject) {
    if (typeof serverSaveFn === "function") {
      serverSaveFn(key, "").then(d => {
        LocalConfig.remove(key);
        resolve();
      });
    } else {
      LocalConfig.remove(key);
      resolve();
    }
  });
}

export function treeToList(arr) {
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
      getChildren(d);
    } else {
      leafs.push(d);
    }
  }

  function getChildren(d) {
    const tempArr = d.children || [];

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

export function treeForEach(arr, fn) {
  let treeList = arr || [];

  for (let i = 0; i < treeList.length; i++) {
    const d = treeList[i];

    let bl = fn(d, i);

    if (bl === false) {
      break;
    }

    if (d.children && d.children.length > 0) {
      getChildren(d);
    }
  }

  function getChildren(node) {
    const tempArr = node.children || [];

    for (let i = 0; i < tempArr.length; i++) {
      const d = tempArr[i];

      let bl = fn(d, i);

      if (bl === false) {
        break;
      }

      if (d.children && d.children.length > 0) {
        getChildren(d);
      }
    }
  }

  return treeList;
}
