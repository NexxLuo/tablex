"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactWindow = require("react-window");

var _reactVirtualizedAutoSizer = _interopRequireDefault(require("react-virtualized-auto-sizer"));

var _loadingIcon = _interopRequireDefault(require("./loadingIcon"));

var _noDataMsg = _interopRequireDefault(require("./noDataMsg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var TableBody =
/*#__PURE__*/
function (_React$Component) {
  _inherits(TableBody, _React$Component);

  function TableBody() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, TableBody);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(TableBody)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _this.getColumn = function (index) {
      var columnLeafs = _this.props.columnLeafs;
      return columnLeafs[index];
    };

    _this.getColumnWidth = function () {
      var columnLeafs = _this.props.columnLeafs;
      var cw = 0;
      columnLeafs.forEach(function (d) {
        cw += d.width || 100;
      });
      return cw;
    };

    _this.columnWidth = function (index, width) {
      var column = _this.getColumn(index);

      var cw = _this.getColumnWidth();

      if (column) {
        return column.width || 100;
      }

      return width - cw - 6;
    };

    _this.isLoadingChildren = function (key) {
      var loadingKeys = _this.props.loadingKeys;
      return loadingKeys.indexOf(key) > -1;
    };

    _this.expandableEl = function (columnIndex, rowIndex, row) {
      var _this$props = _this.props,
          rowIndent = _this$props.rowIndent,
          _this$props$expandedK = _this$props.expandedKeys,
          expandedKeys = _this$props$expandedK === void 0 ? [] : _this$props$expandedK,
          rowKey = _this$props.rowKey;
      var indent = (row.__depth || 0) * rowIndent;
      var key = row[rowKey];

      var isLoading = _this.isLoadingChildren(key);

      var isExpand = false;
      var icon = "+";

      if (expandedKeys.indexOf(key) > -1) {
        isExpand = true;
        icon = "-";
      } else {
        isExpand = false;
        icon = "+";
      }

      var iconFlag = _react.default.createElement("span", {
        className: "tablex-row-expand-placeholder"
      });

      if (row.children) {
        iconFlag = _react.default.createElement("span", {
          className: "tablex-row-expand-icon",
          onClick: function onClick() {
            _this.props.onExpandChange(isExpand, key);
          }
        }, icon);
      }

      if (isLoading === true) {
        iconFlag = _react.default.createElement(_loadingIcon.default, null);
      }

      if (columnIndex === 0) {
        return _react.default.createElement(_react.default.Fragment, null, indent > 0 ? _react.default.createElement("span", {
          className: "tablex-row-indent",
          style: {
            marginLeft: indent
          }
        }) : null, iconFlag);
      }

      return null;
    };

    _this.renderCell = function (_ref) {
      var columnIndex = _ref.columnIndex,
          rowIndex = _ref.rowIndex,
          style = _ref.style;
      var dataSource = _this.props.dataSource;

      if (dataSource.length === 0) {
        return _react.default.createElement("div", null);
      }

      var column = _this.getColumn(columnIndex);

      if (column) {
        var c = column.dataIndex;
        var row = dataSource[rowIndex];

        var expandableEl = _this.expandableEl(columnIndex, rowIndex, row);

        var cellData = row[c];

        if (typeof column.render === "function") {
          return _react.default.createElement("div", {
            className: "tablex-cell",
            style: style
          }, expandableEl, " ", column.render(cellData, row, rowIndex));
        } else {
          return _react.default.createElement("div", {
            className: "tablex-cell",
            style: style
          }, expandableEl, cellData);
        }
      }

      return _react.default.createElement("div", {
        className: "tablex-cell",
        style: _objectSpread({}, style, {
          borderRight: "none"
        })
      });
    };

    return _this;
  }

  _createClass(TableBody, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          columns = _this$props2.columns,
          columnLeafs = _this$props2.columnLeafs,
          dataSource = _this$props2.dataSource,
          onScroll = _this$props2.onScroll;
      var columnWidth = 0;
      columnLeafs.forEach(function (d) {
        columnWidth += d.width || 100;
      });
      var rowCount = dataSource.length;
      return _react.default.createElement(_reactVirtualizedAutoSizer.default, null, function (_ref2) {
        var height = _ref2.height,
            width = _ref2.width;
        var len = columnLeafs.length;

        if (width > columnWidth) {
          len = len + 1;
        }

        var NoData = null;

        if (dataSource.length === 0) {
          rowCount = 1;
          NoData = _react.default.createElement(_noDataMsg.default, null);
        }

        return _react.default.createElement(_react.default.Fragment, null, NoData, _react.default.createElement(_reactWindow.VariableSizeGrid, {
          columnCount: len,
          columnWidth: function columnWidth(i) {
            return _this2.columnWidth(i, width);
          },
          height: height,
          rowCount: rowCount,
          rowHeight: function rowHeight() {
            return 35;
          },
          width: width,
          onScroll: onScroll
        }, _this2.renderCell));
      });
    }
  }]);

  return TableBody;
}(_react.default.Component);

TableBody.defaultProps = {
  columns: [],
  columnLeafs: [],
  dataSource: [],
  rowIndent: 20,
  expandedKeys: [],
  loadingKeys: []
};
TableBody.propTypes = {
  /**
   * 主要用于行展开
   */
  rowKey: _propTypes.default.string.isRequired,
  columns: _propTypes.default.array.isRequired,
  columnLeafs: _propTypes.default.array.isRequired,
  dataSource: _propTypes.default.array.isRequired,
  onScroll: _propTypes.default.func,

  /**
   * @isExpand 是否展开
   * @key 受影响的行数据key
   */
  onExpandChange: _propTypes.default.func,
  rowIndent: _propTypes.default.number,
  expandedKeys: _propTypes.default.array,
  loadingKeys: _propTypes.default.array
};
var _default = TableBody;
exports.default = _default;