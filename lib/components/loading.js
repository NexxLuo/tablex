"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

require("./loading.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default() {
  return _react.default.createElement("div", {
    className: "tablex-loading"
  }, _react.default.createElement("div", {
    class: "tablex-spin  tablex-spin-spinning"
  }, _react.default.createElement("span", {
    class: "tablex-spin-dot tablex-spin-dot-spin"
  }, _react.default.createElement("i", {
    class: "tablex-spin-dot-item"
  }), _react.default.createElement("i", {
    class: "tablex-spin-dot-item"
  }), _react.default.createElement("i", {
    class: "tablex-spin-dot-item"
  }), _react.default.createElement("i", {
    class: "tablex-spin-dot-item"
  }))), _react.default.createElement("div", null, "\u6570\u636E\u52A0\u8F7D\u4E2D..."));
};

exports.default = _default;