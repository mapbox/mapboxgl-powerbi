"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (pattern) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: pattern,
      possible: [_lodash.isRegExp, _lodash.isString]
    });
    if (!validOptions) {
      return;
    }

    var normalizedPattern = (0, _lodash.isString)(pattern) ? new RegExp(pattern) : pattern;

    root.walkRules(function (rule) {
      if ((0, _utils.cssRuleHasSelectorEndingWithColon)(rule)) {
        return;
      }
      (0, _postcssSelectorParser2.default)(checkSelector).process(rule.selector);

      function checkSelector(fullSelector) {
        fullSelector.eachInside(function (selectorNode) {
          if (selectorNode.type !== "id") {
            return;
          }
          var value = selectorNode.value;
          var sourceIndex = selectorNode.sourceIndex;


          if (!normalizedPattern.test(value)) {
            (0, _utils.report)({
              result: result,
              ruleName: ruleName,
              message: messages.expected(value),
              node: rule,
              index: sourceIndex
            });
          }
        });
      }
    });
  };
};

var _postcssSelectorParser = require("postcss-selector-parser");

var _postcssSelectorParser2 = _interopRequireDefault(_postcssSelectorParser);

var _lodash = require("lodash");

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "selector-id-pattern";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(selectorValue) {
    return "Expected id selector \"#" + selectorValue + "\" to match specified pattern";
  }
});