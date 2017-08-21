"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (blacklist) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: blacklist,
      possible: [_lodash.isObject]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      var prop = decl.prop;
      var value = decl.value;

      var unprefixedProp = _postcss.vendor.unprefixed(prop);

      var propBlacklist = (0, _lodash.find)(blacklist, function (list, propIdentifier) {
        return (0, _utils.matchesStringOrRegExp)(unprefixedProp, propIdentifier);
      });

      if (!propBlacklist) {
        return;
      }

      (0, _postcssValueParser2.default)(value).walk(function (node) {
        if (node.type === "string") {
          return;
        }

        var unit = _postcssValueParser2.default.unit(node.value).unit;

        if (propBlacklist.indexOf(unit) !== -1) {
          (0, _utils.report)({
            message: messages.rejected(prop, unit),
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

var _postcss = require("postcss");

var _lodash = require("lodash");

var _postcssValueParser = require("postcss-value-parser");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "property-unit-blacklist";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(p, u) {
    return "Unexpected unit \"" + u + "\" for property \"" + p + "\"";
  }
});