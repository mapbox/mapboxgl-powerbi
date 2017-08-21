"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation, options) {
  var checker = (0, _utils.whitespaceChecker)("space", expectation, messages);
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never", "always-single-line", "never-single-line", "always-multi-line", "never-multi-line"]
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
      // Return early if blockless or has an empty block
      if (!(0, _utils.cssStatementHasBlock)(statement) || (0, _utils.cssStatementHasEmptyBlock)(statement)) {
        return;
      }

      // Return early if at-rule is to be ignored
      if (cssStatementIsIgnoredAtRule(statement, options)) {
        return;
      }

      var source = (0, _utils.cssStatementStringBeforeBlock)(statement);

      checker.before({
        source: source,
        index: source.length,
        lineCheckStr: (0, _utils.cssStatementBlockString)(statement),
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

exports.cssStatementIsIgnoredAtRule = cssStatementIsIgnoredAtRule;

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "block-opening-brace-space-before";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedBefore: function expectedBefore() {
    return "Expected single space before \"{\"";
  },
  rejectedBefore: function rejectedBefore() {
    return "Unexpected whitespace before \"{\"";
  },
  expectedBeforeSingleLine: function expectedBeforeSingleLine() {
    return "Expected single space before \"{\" of a single-line block";
  },
  rejectedBeforeSingleLine: function rejectedBeforeSingleLine() {
    return "Unexpected whitespace before \"{\" of a single-line block";
  },
  expectedBeforeMultiLine: function expectedBeforeMultiLine() {
    return "Expected single space before \"{\" of a multi-line block";
  },
  rejectedBeforeMultiLine: function rejectedBeforeMultiLine() {
    return "Unexpected whitespace before \"{\" of a multi-line block";
  }
});

function cssStatementIsIgnoredAtRule(statement, options) {
  return options && options.ignoreAtRules && statement.type === "atrule" && (0, _utils.matchesStringOrRegExp)(statement.name, options.ignoreAtRules);
}