"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {

  var checker = (0, _utils.whitespaceChecker)("space", expectation, messages);

  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never", "always-single-line", "never-single-line", "always-multi-line", "never-multi-line"]
    });
    if (!validOptions) {
      return;
    }

    // Check both kinds of statements: rules and at-rules
    root.walkRules(check);
    root.walkAtRules(check);

    function check(statement) {
      var nextNode = statement.next();
      if (!nextNode) {
        return;
      }
      if (!(0, _utils.cssStatementHasBlock)(statement)) {
        return;
      }

      checker.after({
        source: (0, _utils.rawNodeString)(nextNode),
        index: -1,
        lineCheckStr: (0, _utils.cssStatementBlockString)(statement),
        err: function err(msg) {
          (0, _utils.report)({
            message: msg,
            node: statement,
            index: statement.toString().length,
            result: result,
            ruleName: ruleName
          });
        }
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "block-closing-brace-space-after";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedAfter: function expectedAfter() {
    return "Expected single space after \"}\"";
  },
  rejectedAfter: function rejectedAfter() {
    return "Unexpected whitespace after \"}\"";
  },
  expectedAfterSingleLine: function expectedAfterSingleLine() {
    return "Expected single space after \"}\" of a single-line block";
  },
  rejectedAfterSingleLine: function rejectedAfterSingleLine() {
    return "Unexpected whitespace after \"}\" of a single-line block";
  },
  expectedAfterMultiLine: function expectedAfterMultiLine() {
    return "Expected single space after \"}\" of a multi-line block";
  },
  rejectedAfterMultiLine: function rejectedAfterMultiLine() {
    return "Unexpected whitespace after \"}\" of a multi-line block";
  }
});