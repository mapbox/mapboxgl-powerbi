"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (max) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: max,
      possible: [function (max) {
        // Check that the max specificity is in the form "a,b,c"
        var pattern = new RegExp("^\\d+,\\d+,\\d+$");
        return pattern.test(max);
      }]
    });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {
      // Using rule.selectors gets us each selector in the eventuality we have a comma separated set
      rule.selectors.forEach(function (selector) {
        // Return early if there is interpolation in the selector
        if (/#{.+?}|@{.+?}|\$\(.+?\)/.test(selector)) {
          return;
        }

        (0, _postcssResolveNestedSelector2.default)(selector, rule).forEach(function (resolvedSelector) {
          // calculate() returns a four section string — we only need 3 so strip the first two characters
          var computedSpecificity = (0, _specificity.calculate)(resolvedSelector)[0].specificity.substring(2);
          // Check if the selector specificity exceeds the allowed maximum
          if (parseFloat(computedSpecificity.replace(/,/g, "")) > parseFloat(max.replace(/,/g, ""))) {
            (0, _utils.report)({
              ruleName: ruleName,
              result: result,
              node: rule,
              message: messages.expected(resolvedSelector, max),
              word: selector
            });
          }
        });
      });
    });
  };
};

var _specificity = require("specificity");

var _postcssResolveNestedSelector = require("postcss-resolve-nested-selector");

var _postcssResolveNestedSelector2 = _interopRequireDefault(_postcssResolveNestedSelector);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "selector-max-specificity";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(selector, specificity) {
    return "Expected \"" + selector + "\" to have a specificity equal to or less than \"" + specificity + "\"";
  }
});