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

    root.walkDecls(function (decl) {
      var declString = decl.toString();

      (0, _utils.styleSearch)({ source: declString, target: "#" }, function (match) {
        // If there's not a colon, comma, or whitespace character before, we'll assume this is
        // not intended to be a hex color, but is instead something like the
        // hash in a url() argument
        if (!/[:,\s]/.test(declString[match.startIndex - 1])) {
          return;
        }

        var hexMatch = /^#[0-9A-Za-z]+/.exec(declString.substr(match.startIndex));
        if (!hexMatch) {
          return;
        }
        var hexValue = hexMatch[0];

        (0, _utils.report)({
          message: messages.rejected(hexValue),
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

var ruleName = exports.ruleName = "color-no-hex";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(c) {
    return "Unexpected hex color \"" + c + "\"";
  }
});