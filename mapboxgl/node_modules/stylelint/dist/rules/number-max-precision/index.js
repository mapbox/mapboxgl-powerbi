"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (precision) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: precision,
      possible: [_lodash.isNumber]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      // Don't bother with strings
      if (decl.prop === "content") {
        return;
      }
      check(decl.toString(), decl);
    });

    root.walkAtRules(function (atRule) {
      var source = (0, _utils.cssStatementHasBlock)(atRule) ? (0, _utils.cssStatementStringBeforeBlock)(atRule, { noBefore: true }) : atRule.toString();
      check(source, atRule);
    });

    function check(source, node) {
      // Negative
      var decimalNumberMatches = (0, _execall2.default)(/(\d*\.(\d+))/g, (0, _utils.blurComments)(source));
      if (!decimalNumberMatches.length) {
        return;
      }

      decimalNumberMatches.forEach(function (match) {
        if (match.sub[1].length <= precision) {
          return;
        }
        (0, _utils.report)({
          result: result,
          ruleName: ruleName,
          node: node,
          index: match.index,
          message: messages.expected(parseFloat(match.sub[0]), precision)
        });
      });
    }
  };
};

var _lodash = require("lodash");

var _execall = require("execall");

var _execall2 = _interopRequireDefault(_execall);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "number-max-precision";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(number, precision) {
    return "Expected \"" + number + "\" to be \"" + number.toFixed(precision) + "\"";
  }
});