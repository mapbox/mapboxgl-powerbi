"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {

  var quoteMsg = function () {
    switch (expectation) {
      case "single":
        return "single quotes";
      case "double":
        return "double quotes";
      case "none":
        return "no quotes";
    }
  }();

  var charDefiesExpectation = function () {
    switch (expectation) {
      case "single":
        return function (c) {
          return c !== "'";
        };
      case "double":
        return function (c) {
          return c !== "\"";
        };
      case "none":
        return function (c) {
          return c === "'" || c === "\"";
        };
    }
  }();

  function strDefiesExpectation(str) {
    return charDefiesExpectation(str[0]) || charDefiesExpectation(str[str.length - 1]);
  }

  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["single", "double", "none"]
    });
    if (!validOptions) {
      return;
    }

    root.walkAtRules(check);
    root.walkRules(check);

    function check(statement) {
      if (statement.type === "atrule") {
        checkAtRuleParams(statement);
      }

      statement.walkDecls(function (decl) {
        (0, _utils.cssFunctionArguments)(decl.toString(), "url", function (args, index) {
          if (strDefiesExpectation(args)) {
            (0, _utils.report)({
              message: messages.expected(quoteMsg),
              node: decl,
              index: index,
              result: result,
              ruleName: ruleName
            });
          }
        });
      });
    }

    function checkAtRuleParams(atRule) {
      (0, _utils.cssFunctionArguments)(atRule.params, "url", function (args, index) {
        if (strDefiesExpectation(args)) {
          (0, _utils.report)({
            message: messages.expected(quoteMsg),
            node: atRule,
            index: index + (0, _utils.mediaQueryParamIndexOffset)(atRule),
            result: result,
            ruleName: ruleName
          });
        }
      });
      (0, _utils.cssFunctionArguments)(atRule.params, "url-prefix", function (args, index) {
        if (strDefiesExpectation(args)) {
          (0, _utils.report)({
            message: messages.expected(quoteMsg, "url-prefix"),
            node: atRule,
            index: index + (0, _utils.mediaQueryParamIndexOffset)(atRule),
            result: result,
            ruleName: ruleName
          });
        }
      });
      (0, _utils.cssFunctionArguments)(atRule.params, "domain", function (args, index) {
        if (strDefiesExpectation(args)) {
          (0, _utils.report)({
            message: messages.expected(quoteMsg, "domain"),
            node: atRule,
            index: index + (0, _utils.mediaQueryParamIndexOffset)(atRule),
            result: result,
            ruleName: ruleName
          });
        }
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "function-url-quotes";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(q) {
    var f = arguments.length <= 1 || arguments[1] === undefined ? "url" : arguments[1];
    return "Expected " + q + " around " + f + " argument";
  }
});