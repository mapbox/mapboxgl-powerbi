"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (actual) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, { actual: actual });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {
      if (rule.selector.indexOf(":root") === -1) {
        return;
      }

      if (rule.selector.trim() === ":root") {
        return;
      }

      (0, _utils.report)({
        message: messages.rejected,
        node: rule,
        result: result,
        ruleName: ruleName
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "selector-root-no-composition";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected composition of the \":root\" selector"
});