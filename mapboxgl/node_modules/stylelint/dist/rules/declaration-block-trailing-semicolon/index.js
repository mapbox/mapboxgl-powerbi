"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never"]
    });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {
      // Return early if an empty rule
      if ((0, _utils.cssStatementHasEmptyBlock)(rule)) {
        return;
      }

      if (!rule.last || rule.last.type !== "decl") {
        return;
      }

      var errorIndexOffset = rule.toString().length;
      var after = rule.raw("after");
      if (after) {
        errorIndexOffset -= after.length;
      }

      var errorIndex = void 0;
      var message = void 0;
      if (expectation === "always") {
        if (rule.raws.semicolon) {
          return;
        }
        errorIndex = errorIndexOffset - 1;
        message = messages.expected;
      }
      if (expectation === "never") {
        if (!rule.raws.semicolon) {
          return;
        }
        errorIndex = errorIndexOffset - 2;
        message = messages.rejected;
      }

      (0, _utils.report)({
        message: message,
        node: rule,
        index: errorIndex,
        result: result,
        ruleName: ruleName
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "declaration-block-trailing-semicolon";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: "Expected a trailing semicolon",
  rejected: "Unexpected trailing semicolon"
});