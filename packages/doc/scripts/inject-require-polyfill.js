/** 产物后处理：注入 require 运行时兜底（antd3 生态残留的少量 CJS require） */
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "../storybook-static/iframe.html");
if (!fs.existsSync(file)) { console.log("iframe.html 不存在，跳过"); process.exit(0); }
let s = fs.readFileSync(file, "utf8");
if (s.includes("require polyfill")) { console.log("polyfill 已存在"); process.exit(0); }
const polyfill = `<script>
// 产物中残留的少量 CJS require 运行时兜底（classnames 内联实现 / 可选 polyfill 置空）
(function() {
  function classnames() {
    var classes = [];
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!arg) continue;
      if (typeof arg === "string" || typeof arg === "number") { classes.push(arg); }
      else if (Array.isArray(arg)) { classes.push(classnames.apply(null, arg)); }
      else if (typeof arg === "object") {
        for (var k in arg) { if (arg.hasOwnProperty(k) && arg[k]) classes.push(k); }
      }
    }
    return classes.join(" ");
  }
  window.require = function(name) {
    if (name === "classnames") return classnames;
    if (name === "mutationobserver-shim") return undefined;
    throw new Error("require polyfill: unsupported " + name);
  };
})();
</script>`;
s = s.replace("<head>", "<head>" + polyfill, 1);
fs.writeFileSync(file, s);
console.log("require polyfill 已注入 iframe.html");
