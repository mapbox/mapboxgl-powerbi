"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["lower", "upper"]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {
      var declString = decl.toString();
      (0, _utils.styleSearch)({ source: declString, target: "#" }, function (match) {

        var hexMatch = /^#[0-9A-Za-z]+/.exec(declString.substr(match.startIndex));
        if (!hexMatch) {
          return;
        }

        var hexValue = hexMatch[0];
        var hexValueLower = hexValue.toLowerCase();
        var hexValueUpper = hexValue.toUpperCase();
        var expectedHex = expectation === "lower" ? hexValueLower : hexValueUpper;

        if (hexValue === expectedHex) {
          return;
        }

        (0, _utils.report)({
          message: messages.expected(hexValue, expectedHex),
          node: decl,
          index: match.startIndex,
          result: result,
          ruleName: ruleName
        });
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "color-hex-case";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(h, v) {
    return "Expected \"" + h + "\" to be \"" + v + "\"";
  }
});