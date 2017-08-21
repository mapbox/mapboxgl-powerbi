"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (blacklist) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: blacklist,
      possible: [_lodash.isString]
    });
    if (!validOptions) {
      return;
    }
    root.walkDecls(function (decl) {
      var value = decl.value;

      (0, _postcssValueParser2.default)(value).walk(function (node) {
        if (node.type === "function" && blacklist.indexOf(_postcss.vendor.unprefixed(node.value)) !== -1) {
          (0, _utils.report)({
            message: messages.rejected(node.value),
            node: decl,
            index: (0, _utils.declarationValueIndexOffset)(decl) + node.sourceIndex,
            result: result,
            ruleName: ruleName
          });
        }
      });
    });
  };
};

var _lodash = require("lodash");

var _postcss = require("postcss");

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "function-blacklist";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(name) {
    return "Unexpected function \"" + name + "\"";
  }
});