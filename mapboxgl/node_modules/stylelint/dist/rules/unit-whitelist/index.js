"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (whitelistInput) {
  var whitelist = [].concat(whitelistInput);
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: whitelist,
      possible: [_lodash.isString]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      var value = decl.value;


      (0, _postcssValueParser2.default)(value).walk(function (node) {
        var unit = _postcssValueParser2.default.unit(node.value).unit;

        if (unit && whitelist.indexOf(unit) === -1 && node.type !== "string") {
          (0, _utils.report)({
            message: messages.rejected(unit),
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

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "unit-whitelist";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(u) {
    return "Unexpected unit \"" + u + "\"";
  }
});