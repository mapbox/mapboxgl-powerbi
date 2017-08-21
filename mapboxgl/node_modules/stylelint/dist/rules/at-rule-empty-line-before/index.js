"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation, options) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never"]
    }, {
      actual: options,
      possible: {
        except: ["blockless-group", "first-nested", "all-nested"],
        ignore: ["after-comment", "all-nested"]
      },
      optional: true
    });
    if (!validOptions) {
      return;
    }

    root.walkAtRules(function (atRule) {

      // Ignore the first node
      if (atRule === root.first) {
        return;
      }

      var isNested = atRule.parent !== root;
      if ((0, _utils.optionsHaveIgnored)(options, "all-nested") && isNested) {
        return;
      }

      // Optionally ignore the expectation if a comment precedes this node
      if ((0, _utils.optionsHaveIgnored)(options, "after-comment") && atRule.prev() && atRule.prev().type === "comment") {
        return;
      }

      var before = atRule.raw("before");
      var emptyLineBefore = before && (before.indexOf("\n\n") !== -1 || before.indexOf("\r\n\r\n") !== -1 || before.indexOf("\n\r\n") !== -1);

      var expectEmptyLineBefore = expectation === "always" ? true : false;

      var previousNode = atRule.prev();

      // Reverse the expectation if any exceptions apply
      if ((0, _utils.optionsHaveException)(options, "all-nested") && isNested || getsFirstNestedException() || getsBlocklessGroupException()) {
        expectEmptyLineBefore = !expectEmptyLineBefore;
      }

      // Return if the exceptation is met
      if (expectEmptyLineBefore === emptyLineBefore) {
        return;
      }

      var message = expectEmptyLineBefore ? messages.expected : messages.rejected;

      (0, _utils.report)({
        message: message,
        node: atRule,
        result: result,
        ruleName: ruleName
      });

      function getsBlocklessGroupException() {
        return (0, _utils.optionsHaveException)(options, "blockless-group") && previousNode && previousNode.type === "atrule" && !(0, _utils.cssStatementHasBlock)(previousNode) && !(0, _utils.cssStatementHasBlock)(atRule);
      }

      function getsFirstNestedException() {
        return (0, _utils.optionsHaveException)(options, "first-nested") && isNested && atRule === atRule.parent.first;
      }
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "at-rule-empty-line-before";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: "Expected empty line before at-rule",
  rejected: "Unexpected empty line before at-rule"
});