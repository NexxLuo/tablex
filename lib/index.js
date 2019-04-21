"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _body = _interopRequireDefault(require("./components/body"));

var _head = _interopRequireDefault(require("./components/head"));

require("./index.css");

var _treeDataUtils = require("./tree-data-utils");

var _loading = _interopRequireDefault(require("./components/loading"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Table =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Table, _React$Component);

  function Table() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Table);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Table)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.state = {
      rowKey: undefined,
      columns: [],
      columnLeafs: [],
      dataSource: [],
      dataList: [],
      expandedKeys: [],
      loadingKeys: []
    };

    _this.onBodyScroll = function (_ref) {
      var scrollLeft = _ref.scrollLeft;
      var head = _this.refs["head"];
      head.scrollTo(scrollLeft, 0);
    };

    _this.onExpandChange = function (isExpand, key) {
      isExpand === true ? _this.collapse(key) : _this.expand(key);
    };

    _this.expand = function (key) {
      var expandedKeys = _this.state.expandedKeys;

      var nextExpandedKeys = _toConsumableArray(expandedKeys);

      var i = expandedKeys.indexOf(key);

      if (i === -1) {
        nextExpandedKeys.push(key);
      }

      _this.setState({
        expandedKeys: nextExpandedKeys
      });

      if (typeof _this.props.loadChildrenData === "function") {
        _this.loadChildrenData(key);
      }
    };

    _this.collapse = function (key) {
      var expandedKeys = _this.state.expandedKeys;

      var nextExpandedKeys = _toConsumableArray(expandedKeys);

      var i = expandedKeys.indexOf(key);

      if (i > -1) {
        nextExpandedKeys.splice(i, 1);
      }

      _this.setState({
        expandedKeys: nextExpandedKeys
      });
    };

    _this.setLoadingChildren = function (key, bl, callback) {
      var loadingKeys = _this.state.loadingKeys;
      var i = loadingKeys.indexOf(key);

      var nextKeys = _toConsumableArray(loadingKeys);

      if (bl === true) {
        if (i === -1) {
          nextKeys.push(key);
        }
      } else {
        if (i > -1) {
          nextKeys.splice(i, 1);
        }
      }

      return _this.setState({
        loadingKeys: nextKeys
      }, callback);
    };

    _this.loadChildrenData = function (key) {
      var _this$state = _this.state,
          dataList = _this$state.dataList,
          rowKey = _this$state.rowKey;
      var row = dataList.find(function (d) {
        return d[rowKey] === key;
      });

      var res = _this.props.loadChildrenData(row);

      if (res && res.constructor.name === "Promise") {
        _this.setLoadingChildren(key, true);

        res.then(function (childrens) {
          if (childrens) {
            row.children = childrens;
          }

          _this.setLoadingChildren(key, false);
        });
        res.catch(function (e) {
          _this.setLoadingChildren(key, false);
        });
      }
    };

    return _this;
  }

  _createClass(Table, [{
    key: "render",
    value: function render() {
      var _this$state2 = this.state,
          columns = _this$state2.columns,
          columnLeafs = _this$state2.columnLeafs,
          dataList = _this$state2.dataList,
          rowKey = _this$state2.rowKey,
          expandedKeys = _this$state2.expandedKeys,
          loadingKeys = _this$state2.loadingKeys,
          loading = _this$state2.loading;
      return _react.default.createElement("div", {
        className: "tablex"
      }, _react.default.createElement("div", {
        className: "tablex-head",
        ref: "head"
      }, _react.default.createElement(_head.default, {
        columns: columns,
        columnLeafs: columnLeafs
      })), _react.default.createElement("div", {
        className: "tablex-body"
      }, _react.default.createElement(_body.default, {
        rowKey: rowKey,
        columns: columns,
        columnLeafs: columnLeafs,
        dataSource: dataList,
        onScroll: this.onBodyScroll,
        onExpandChange: this.onExpandChange,
        expandedKeys: expandedKeys,
        loadingKeys: loadingKeys
      }), loading === true ? _react.default.createElement(_loading.default, null) : null));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var expandedKeys = prevState.expandedKeys;
      var rowKey = nextProps.rowKey,
          columns = nextProps.columns,
          dataSource = nextProps.dataSource,
          loading = nextProps.loading;

      var _treeToList = (0, _treeDataUtils.treeToList)(columns),
          columnLeafs = _treeToList.leafs;

      var dataList = dataSource;

      if (expandedKeys.length > 0) {
        dataList = (0, _treeDataUtils.getDataListWithExpanded)(dataSource, expandedKeys, rowKey);
      }

      var nextState = {
        rowKey: rowKey,
        columns: columns,
        dataSource: dataSource,
        columnLeafs: columnLeafs,
        dataList: dataList,
        loading: !!loading
      };
      return nextState;
    }
    /**
     * @isExpand 是否展开
     * @key 受影响的行数据key
     */

  }]);

  return Table;
}(_react.default.Component);

Table.defaultProps = {
  columns: [],
  dataSource: [],
  loading: false
};
Table.propTypes = {
  /**
   * 表格列
   *
   */
  columns: _propTypes.default.array.isRequired,

  /**
   * 表格数据
   */
  dataSource: _propTypes.default.array.isRequired,

  /** 数据行主键字段
   * 主要用于行展开
   */
  rowKey: _propTypes.default.string.isRequired,

  /** 行展开变化事件
   * @expandedRows 展开的行
   */
  onExpandedRowsChange: _propTypes.default.func,
  rowIndent: _propTypes.default.number,
  expandedKeys: _propTypes.default.array,
  loadChildrenData: _propTypes.default.func,
  loading: _propTypes.default.bool
};
var _default = Table;
exports.default = _default;