"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (max) {
  var maxAdjacentNewlines = max + 1;

  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: max,
      possible: _lodash.isNumber
    });
    if (!validOptions) {
      return;
    }

    var rootString = root.toString();
    (0, _utils.styleSearch)({ source: rootString, target: "\n", checkComments: true }, function (match) {
      if (rootString.substr(match.startIndex + 1, maxAdjacentNewlines) === (0, _lodash.repeat)("\n", maxAdjacentNewlines) || rootString.substr(match.startIndex + 1, maxAdjacentNewlines * 2) === (0, _lodash.repeat)("\r\n", maxAdjacentNewlines)) {
        (0, _utils.report)({
          message: messages.rejected,
          node: root,
          index: match.startIndex,
          result: result,
          ruleName: ruleName
        });
      }
    });
  };
};

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "max-empty-lines";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected empty line"
});