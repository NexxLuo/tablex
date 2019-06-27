import orderBy from "lodash/orderBy";

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

//从localStorage中获取所有表格配置
function getConfigs() {
  let allConfigs = JSON.parse(
    window.localStorage.getItem("__tableSettings") || "[]"
  );

  return allConfigs;
}

//设置表格配置到localStorage
function setConfigs(configs) {
  window.localStorage.setItem("__tableSettings", JSON.stringify(configs));
}

//根据tableId从localStorage中获取所有表格配置
function getStorage(tableId) {
  let allConfigs = getConfigs();

  if (tableId) {
    let tableConfig = allConfigs.find(d => d.tableId === tableId);

    let settings = {};
    if (tableConfig) {
      if (typeof tableConfig === "string") {
        settings = JSON.parse(tableConfig);
      } else {
        settings = tableConfig;
      }
    }

    return settings;
  } else {
    return allConfigs;
  }
}

window._getTableSetting = getStorage;

//以tableId表格配置到localStorage
function setStorage(tableId, configs) {
  configs = Object.assign(configs, {
    time: getTime(),
    tableId: tableId
  });

  let allConfigs = getConfigs();
  let tableConfig = allConfigs.find(d => d.tableId === tableId);

  if (tableConfig !== null && tableConfig !== undefined) {
    tableConfig = Object.assign(tableConfig, configs);
  } else {
    allConfigs.push(configs);
  }

  setConfigs(allConfigs);
}

//删除localStorage中的配置
function deleteStorage(tableId) {
  let allConfigs = getConfigs();
  let i = allConfigs.findIndex(d => d.tableId === tableId);

  if (i > -1) {
    allConfigs.splice(i, 1);
    setConfigs(allConfigs);
  }
}

//保存表格配置数据到本地
export function saveLocalSetting(tableId, settings) {
  setStorage(tableId, settings);
}

export function updateLocalSetted(tableId, settings) {
  setStorage(tableId, settings);
}

//保存数据至服务器
export function saveServeSetting(tableId, settings, onSettingSave) {
  settings = Object.assign(settings, {
    time: getTime(),
    tableId: tableId
  });

  let tableSettingSaveFn = onSettingSave;
  if (typeof onSettingSave !== "function") {
    tableSettingSaveFn = window.__tableSetting_save;
  }

  return new Promise(function(resolve, reject) {
    if (typeof tableSettingSaveFn === "function") {
      tableSettingSaveFn(tableId, settings).then(d => {
        resolve(settings);
      });
    } else {
      resolve(settings);
    }
  });
}

//配置窗口 保存
export function saveSetting(tableId, settings, onSettingSave) {
  saveLocalSetting(tableId, settings);

  return saveServeSetting(tableId, settings, onSettingSave);
}

//配置窗口 重置
export function clearSettings(tableId, onSettingSave) {
  let tableSettingSaveFn = onSettingSave;
  if (typeof onSettingSave !== "function") {
    tableSettingSaveFn = window.__tableSetting_save;
  }

  return new Promise(function(resolve, reject) {
    if (typeof tableSettingSaveFn === "function") {
      tableSettingSaveFn(tableId, "").then(d => {
        deleteStorage(tableId);
        resolve();
      });
    } else {
      deleteStorage(tableId);
      resolve();
    }
  });
}

export function getSetting(tableId) {
  return new Promise(function(resolve, reject) {
    let settings = getStorage(tableId);

    resolve(settings);
  });
}

export function getSettedConfig(tableId) {
  return new Promise(function(resolve, reject) {
    let settings = getStorage(tableId);

    settings.columns = orderBy(
      settings.columns || [],
      ["__sortIndex"],
      ["asc"]
    );

    resolve(settings);
  });
}

export function getColumnsFromSetted(columns = [], settedColumns = []) {
  if (settedColumns.length > 0) {
    columns.forEach(d => {
      let setted = settedColumns.find(c => c.dataIndex === d.dataIndex);
      if (setted !== null && setted !== undefined) {
        if (typeof setted.width === "number") {
          d.width = setted.width;
        }

        if (typeof setted.hidden !== "undefined") {
          d.hidden = !!setted.hidden;
        }

        if (typeof setted.fixed !== "undefined") {
          d.fixed = setted.fixed || "none";
        }

        if (typeof setted.__sortIndex === "number") {
          d.__sortIndex = setted.__sortIndex;
        }
      }
    });

    // columns.sort((a, b) => {
    //     if (a.__sortIndex == undefined) {
    //         return 0
    //     } else if (b.__sortIndex === undefined) {
    //         return -1;
    //     } else {
    //         return a.__sortIndex - b.__sortIndex;
    //     }
    // });

    columns = orderBy(columns, ["__sortIndex"], ["asc"]);
  }

  return columns;
}

export function getColumnsFromConfig(columns = [], configedColumns = []) {
  if (configedColumns.length > 0) {
    columns.forEach(d => {
      let configed = configedColumns.find(c => c.dataIndex === d.dataIndex);
      if (configed !== null && configed !== undefined) {
        if (typeof configed.hidden !== "undefined") {
          d.hidden = !!configed.hidden;
        }

        if (typeof configed.fixed !== "undefined") {
          d.fixed = configed.fixed || "none";
        }

        if (typeof configed.width === "number") {
          d.width = configed.width;
        }
      }
    });
  }

  return columns;
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
