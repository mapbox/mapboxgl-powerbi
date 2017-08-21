"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (actual) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, { actual: actual });
    if (!validOptions) {
      return;
    }

    var cssString = root.toString();
    (0, _utils.styleSearch)({ source: cssString, target: "\n", withinStrings: true }, function (match) {
      if (cssString[match.startIndex - 1] === "\\") {
        return;
      }
      (0, _utils.report)({
        message: messages.rejected,
        node: root,
        index: match.startIndex,
        result: result,
        ruleName: ruleName
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "string-no-newline";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected newline in string"
});