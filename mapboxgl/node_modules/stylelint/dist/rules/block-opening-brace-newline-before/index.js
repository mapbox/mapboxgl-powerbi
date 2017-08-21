"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  var checker = (0, _utils.whitespaceChecker)("newline", expectation, messages);

  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "always-single-line", "never-single-line", "always-multi-line", "never-multi-line"]
    });
    if (!validOptions) {
      return;
    }

    // Check both kinds of statement: rules and at-rules
    root.walkRules(check);
    root.walkAtRules(check);

    function check(statement) {

      // Return early if blockless or has an empty block
      if (!(0, _utils.cssStatementHasBlock)(statement) || (0, _utils.cssStatementHasEmptyBlock)(statement)) {
        return;
      }

      var beforeBrace = (0, _utils.cssStatementStringBeforeBlock)(statement);

      checker.beforeAllowingIndentation({
        lineCheckStr: (0, _utils.cssStatementBlockString)(statement),
        source: beforeBrace,
        index: beforeBrace.length,
        err: function err(m) {
          (0, _utils.report)({
            message: m,
            node: statement,
            index: (0, _utils.cssStatementStringBeforeBlock)(statement, { noBefore: true }).length - 1,
            result: result,
            ruleName: ruleName
          });
        }
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "block-opening-brace-newline-before";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedBefore: function expectedBefore() {
    return "Expected newline before \"{\"";
  },
  expectedBeforeSingleLine: function expectedBeforeSingleLine() {
    return "Expected newline before \"{\" of a single-line block";
  },
  rejectedBeforeSingleLine: function rejectedBeforeSingleLine() {
    return "Unexpected whitespace before \"{\" of a single-line block";
  },
  expectedBeforeMultiLine: function expectedBeforeMultiLine() {
    return "Expected newline before \"{\" of a multi-line block";
  },
  rejectedBeforeMultiLine: function rejectedBeforeMultiLine() {
    return "Unexpected whitespace before \"{\" of a multi-line block";
  }
});