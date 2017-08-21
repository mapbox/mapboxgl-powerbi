"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {

  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["single", "double"]
    });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {
      var selector = rule.selector;

      // get out early if no pseudo elements or classes
      if (selector.indexOf(":") === -1) {
        return;
      }

      // match only level 1 and 2 pseudo elements
      (0, _utils.styleSearch)({ source: selector, target: [":before", ":after", ":first-line", ":first-letter"] }, function (match) {

        var prevCharIsColon = selector[match.startIndex - 1] === ":";

        if (expectation === "single" && !prevCharIsColon) {
          return;
        }
        if (expectation === "double" && prevCharIsColon) {
          return;
        }

        (0, _utils.report)({
          message: messages.expected(expectation),
          node: rule,
          index: match.startIndex,
          result: result,
          ruleName: ruleName
        });
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "selector-pseudo-element-colon-notation";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(q) {
    return "Expected " + q + " colon pseudo-element notation";
  }
});