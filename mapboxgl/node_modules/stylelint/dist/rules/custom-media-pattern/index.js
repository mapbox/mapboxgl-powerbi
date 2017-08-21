"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (pattern) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: pattern,
      possible: [_lodash.isRegExp, _lodash.isString]
    });
    if (!validOptions) {
      return;
    }

    var regexpPattern = (0, _lodash.isString)(pattern) ? new RegExp(pattern) : pattern;

    root.walkAtRules(function (atRule) {
      if (atRule.name !== "custom-media") {
        return;
      }

      var customMediaName = atRule.params.match(/^--(\S+)\b/)[1];

      if (!regexpPattern.test(customMediaName)) {
        (0, _utils.report)({
          message: messages.expected,
          node: atRule,
          index: (0, _utils.mediaQueryParamIndexOffset)(atRule),
          result: result,
          ruleName: ruleName
        });
      }
    });
  };
};

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "custom-media-pattern";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: "Expected custom media query name to match specified pattern"
});