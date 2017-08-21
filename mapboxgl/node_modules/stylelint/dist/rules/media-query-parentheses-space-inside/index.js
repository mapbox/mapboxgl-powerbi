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

    root.walkAtRules(function (atRule) {
      if (atRule.name !== "media") {
        return;
      }

      var params = atRule.params;
      var indexBoost = (0, _utils.mediaQueryParamIndexOffset)(atRule);

      (0, _utils.styleSearch)({ source: params, target: "(" }, function (match) {
        var nextCharIsSpace = params[match.startIndex + 1] === " ";
        if (nextCharIsSpace && expectation === "never") {
          (0, _utils.report)({
            message: messages.rejectedOpening,
            node: atRule,
            index: match.startIndex + 1 + indexBoost,
            result: result,
            ruleName: ruleName
          });
        }
        if (!nextCharIsSpace && expectation === "always") {
          (0, _utils.report)({
            message: messages.expectedOpening,
            node: atRule,
            index: match.startIndex + 1 + indexBoost,
            result: result,
            ruleName: ruleName
          });
        }
      });

      (0, _utils.styleSearch)({ source: params, target: ")" }, function (match) {
        var prevCharIsSpace = params[match.startIndex - 1] === " ";
        if (prevCharIsSpace && expectation === "never") {
          (0, _utils.report)({
            message: messages.rejectedClosing,
            node: atRule,
            index: match.startIndex - 1 + indexBoost,
            result: result,
            ruleName: ruleName
          });
        }
        if (!prevCharIsSpace && expectation === "always") {
          (0, _utils.report)({
            message: messages.expectedClosing,
            node: atRule,
            index: match.startIndex - 1 + indexBoost,
            result: result,
            ruleName: ruleName
          });
        }
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "media-query-parentheses-space-inside";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedOpening: "Expected single space after \"(\"",
  rejectedOpening: "Unexpected whitespace after \"(\"",
  expectedClosing: "Expected single space before \")\"",
  rejectedClosing: "Unexpected whitespace before \")\""
});