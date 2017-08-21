"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation, options) {
  var checker = (0, _utils.whitespaceChecker)("newline", expectation, messages);
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "always-single-line", "never-single-line", "always-multi-line", "never-multi-line"]
    }, {
      actual: options,
      possible: {
        ignoreAtRules: [_lodash.isString]
      },
      optional: true
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
      if ((0, _blockOpeningBraceSpaceBefore.cssStatementIsIgnoredAtRule)(statement, options)) {
        return;
      }

      // Only check one after, because there might be other
      // spaces handled by the indentation rule
      checker.afterOneOnly({
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

var _lodash = require("lodash");

var _utils = require("../../utils");

var _blockOpeningBraceSpaceBefore = require("../block-opening-brace-space-before");

var ruleName = exports.ruleName = "block-closing-brace-newline-after";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedAfter: function expectedAfter() {
    return "Expected newline after \"}\"";
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