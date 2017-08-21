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

    root.walkDecls(function (decl) {
      check(decl.toString(), decl);
    });

    root.walkAtRules(function (atRule) {
      var source = (0, _utils.cssStatementHasBlock)(atRule) ? (0, _utils.cssStatementStringBeforeBlock)(atRule, { noBefore: true }) : atRule.toString();
      check(source, atRule);
    });

    function check(source, node) {
      // Get out quickly if there are no periods
      if (source.indexOf(".") === -1) {
        return;
      }

      // Check leading zero
      if (expectation === "always") {
        var errors = matchesLackingLeadingZero(source);
        if (!_lodash2.default.isEmpty(errors)) {
          errors.forEach(function (error) {
            complain(messages.expected, node, error.index);
          });
        }
      }
      if (expectation === "never") {
        var _errors = matchesContainingLeadingZero(source);
        if (!_lodash2.default.isEmpty(_errors)) {
          _errors.forEach(function (error) {
            complain(messages.rejected, node, error.index + 1);
          });
        }
      }
    }

    function complain(message, node, index) {
      (0, _utils.report)({
        result: result,
        ruleName: ruleName,
        message: message,
        node: node,
        index: index
      });
    }
  };
};

var _execall = require("execall");

var _execall2 = _interopRequireDefault(_execall);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "number-leading-zero";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: "Expected a leading zero",
  rejected: "Unexpected leading zero"
});

function matchesLackingLeadingZero(source) {
  return (0, _execall2.default)(/(?:\D|^)(\.\d+)/g, (0, _utils.blurFunctionArguments)(source, "url"));
}

function matchesContainingLeadingZero(source) {
  return (0, _execall2.default)(/(?:\D|^)(0\.\d+)/g, (0, _utils.blurFunctionArguments)(source, "url"));
}