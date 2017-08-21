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

    var rootString = root.toString();
    (0, _utils.styleSearch)({ source: rootString, target: ["\n", "\r"], checkComments: true }, function (match) {
      if (whitespacesToReject.indexOf(rootString[match.startIndex - 1]) !== -1) {
        (0, _utils.report)({
          message: messages.rejected,
          node: root,
          index: match.startIndex - 1,
          result: result,
          ruleName: ruleName
        });
      }
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "no-eol-whitespace";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected whitespace at end of line"
});

var whitespacesToReject = [" ", "\t"];