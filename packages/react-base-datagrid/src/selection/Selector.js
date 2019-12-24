let RangeSelect = new (function() {
  this.keysMap = {};

  this.hasBegin = false;
  this.beginKey = "";

  this.begin = function(key) {
    if (key) {
      // this.keysMap[key] = true;
      this.beginKey = key;
    }
    this.hasBegin = true;

    return this;
  };

  this.end = function() {
    let keys = [];

    let bk = this.beginKey;

    let o = this.keysMap;

    for (const k in o) {
      let v = o[k];
      if (v === true) {
        keys.push(k);
      }
    }

    if (keys.length > 0 && bk) {
      keys.unshift(bk);
    }

    this.hasBegin = false;
    this.keysMap = {};
    return keys;
  };
  this.add = function(key) {
    if (this.hasBegin === true && key) {
      this.keysMap[key] = true;
    }
  };
})();

let AreaSelect = function() {
  this.keysMap = {};
  this.rectKeyMap = {};

  this.hasBegin = false;
  this.beginKey = "";
  this.beginIndex = -1;

  let hasShiftKeyDown = false;
  let shiftStartIndex = -1;

  let el = null;

  let starts = {
    x: 0,
    y: 0
  };

  function keydown(e) {
    if (e.keyCode === 16) {
      hasShiftKeyDown = true;
    }
  }

  function keyup(e) {
    if (e.keyCode === 16) {
      hasShiftKeyDown = false;
    }
  }

  let hasSetIndicator = false;
  let setIndicator = () => {
    if (!hasSetIndicator) {
      let ele = document.createElement("div");
      ele.className = "tablex__areaselect__indicator";
      if (el) {
        document.body.removeChild(el);
      }
      ele.onmouseup = this.end;
      el = ele;
      document.body.appendChild(el);
      hasSetIndicator = true;
    }
  };

  let filterKeys = pos => {
    let o = this.rectKeyMap;
    let ok = this.keysMap;

    for (const k in o) {
      let rect = o[k];

      //outter
      if (rect.y > pos.y + pos.h || rect.y + rect.h < pos.y) {
        ok[k] = false;
      }
      //
    }
  };

  let move = e => {
    if (this.hasBegin === true) {
      setIndicator();
    }

    let distance = 10;

    let offset = {
      x: e.clientX,
      y: e.clientY
    };

    let diff = {
      x: offset.x - starts.x,
      y: offset.y - starts.y
    };

    let size = {
      w: Math.abs(diff.x),
      h: Math.abs(diff.y)
    };

    let pos = {
      x: starts.x,
      y: starts.y
    };

    if (diff.x < 0) {
      pos.x = pos.x - size.w;
    }

    if (diff.y < 0) {
      pos.y = pos.y - size.h;
    }

    if (size.w > distance || size.h > distance) {
      this.hasBegin = true;
    }

    filterKeys({
      x: pos.x,
      y: pos.y,
      w: size.w,
      h: size.h
    });

    if (el) {
      el.style.setProperty("left", pos.x + "px");
      el.style.setProperty("top", pos.y + "px");
      el.style.setProperty("width", size.w + "px");
      el.style.setProperty("height", size.h + "px");
    }
  };

  this.begin = function(e, key) {
    if (key) {
      this.beginKey = key;
    }

    starts.x = e.clientX;
    starts.y = e.clientY;

    if (key) {
      window.addEventListener("mousemove", move);
    }

    return this;
  };

  this.end = function() {
    let keys = [];
    let bk = this.beginKey;

    if (this.hasBegin) {
      let o = this.keysMap;
      for (const k in o) {
        let v = o[k];
        if (v === true) {
          keys.push(k);
        }
      }

      if (keys.length > 0 && bk) {
        keys.unshift(bk);
      }
    }

    window.removeEventListener("mousemove", move);
    if (el) {
      document.body.removeChild(el);
    }

    el = null;
    this.hasBegin = false;
    this.keysMap = {};
    this.rectKeyMap = {};
    this.beginKey = "";
    hasSetIndicator = false;
    return keys;
  };

  this.add = function(e, key) {
    if (this.hasBegin && key) {
      this.keysMap[key] = true;
      let rect = e.target.getBoundingClientRect();
      testText = rect.y;
      this.rectKeyMap[key] = {
        x: rect.x,
        y: rect.y,
        h: rect.height
      };
    }
  };

  this.beginWithIndex = function(e, key, index) {
    if (typeof index === "number") {
      this.beginIndex = index;
    }
    this.begin(e, key);
  };

  this.endWithIndex = function(data, index, keyField) {
    let keys = [];

    if (this.hasBegin === true) {
      let rawStartIndex = this.beginIndex;
      let beginIndex = rawStartIndex;
      let arr = data || [];
      let maxIndex = arr.length - 1;
      let endIndex = index > maxIndex ? maxIndex : index;

      if (rawStartIndex > endIndex) {
        beginIndex = endIndex;
        endIndex = rawStartIndex;
      }

      if (index > -1 && beginIndex > -1) {
        for (let i = beginIndex; i <= endIndex; i++) {
          let d = arr[i];
          if (d) {
            let k = d[keyField] || "";
            k && keys.push(k);
          }
        }
      }
    }

    this.beginIndex = -1;
    this.end();
    return keys;
  };

  this.beginShift = function(index) {
    if (typeof index === "number") {
      shiftStartIndex = index;
    }

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
  };

  this.endShift = function(data, index, keyField) {
    let rawStartIndex = shiftStartIndex;
    let beginIndex = rawStartIndex;

    let arr = data || [];
    let maxIndex = arr.length - 1;
    let endIndex = index > maxIndex ? maxIndex : index;

    if (rawStartIndex > endIndex) {
      beginIndex = endIndex;
      endIndex = rawStartIndex;
    }

    let keys = [];

    if (index > -1 && beginIndex > -1) {
      for (let i = beginIndex; i <= endIndex; i++) {
        let d = arr[i];
        if (d) {
          let k = d[keyField] || "";
          k && keys.push(k);
        }
      }
    }

    shiftStartIndex = -1;
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);

    return keys;
  };

  this.hasShiftKeyDown = function() {
    return hasShiftKeyDown;
  };
};

export { RangeSelect, AreaSelect };
