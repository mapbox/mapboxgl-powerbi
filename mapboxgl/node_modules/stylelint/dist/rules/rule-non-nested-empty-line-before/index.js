"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation, options) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never", "always-multi-line", "never-multi-line"]
    }, {
      actual: options,
      possible: {
        ignore: ["after-comment"]
      },
      optional: true
    });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {

      // Ignore nested rule sets
      if (rule.parent !== root) {
        return;
      }

      // Ignore the first node
      if (rule === root.first) {
        return;
      }

      checkRuleEmptyLineBefore({ rule: rule, expectation: expectation, options: options, result: result, messages: messages, checkedRuleName: ruleName });
    });
  };
};

exports.checkRuleEmptyLineBefore = checkRuleEmptyLineBefore;

var _utils = require("../../utils");

var ruleName = exports.ruleName = "rule-non-nested-empty-line-before";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: "Expected empty line before non-nested rule",
  rejected: "Unexpected empty line before non-nested rule"
});

function checkRuleEmptyLineBefore(_ref) {
  var rule = _ref.rule;
  var expectation = _ref.expectation;
  var options = _ref.options;
  var result = _ref.result;
  var messages = _ref.messages;
  var checkedRuleName = _ref.checkedRuleName;


  var expectEmptyLineBefore = expectation.indexOf("always") !== -1 ? true : false;

  // Optionally ignore the expectation if a comment precedes this node
  if ((0, _utils.optionsHaveIgnored)(options, "after-comment") && rule.prev() && rule.prev().type === "comment") {
    return;
  }

  // Ignore if the exceptation is for multiple and the rule is single-line
  if (expectation.indexOf("multi-line") !== -1 && (0, _utils.isSingleLineString)(rule.toString())) {
    return;
  }

  // Optionally reverse the expectation for the first nested node
  if ((0, _utils.optionsHaveException)(options, "first-nested") && rule === rule.parent.first) {
    expectEmptyLineBefore = !expectEmptyLineBefore;
  }

  var before = rule.raw("before");
  var emptyLineBefore = before && before.indexOf("\n\n") !== -1 || before.indexOf("\r\n\r\n") !== -1 || before.indexOf("\n\r\n") !== -1;

  // Return if the exceptation is met
  if (expectEmptyLineBefore === emptyLineBefore) {
    return;
  }

  var message = expectEmptyLineBefore ? messages.expected : messages.rejected;

  (0, _utils.report)({
    message: message,
    node: rule,
    result: result,
    ruleName: checkedRuleName
  });
}