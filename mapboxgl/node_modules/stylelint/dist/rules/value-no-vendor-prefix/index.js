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
      var prop = decl.prop;

      // Search the full declaration in order to get an accurate index

      (0, _utils.styleSearch)({ source: declString, target: valuePrefixes }, function (match) {
        if (match.startIndex <= prop.length) {
          return;
        }
        var fullIdentifier = /^(-[a-z-]+)\b/.exec(declString.slice(match.startIndex))[1];
        if (_utils.isAutoprefixable.propertyValue(prop, fullIdentifier)) {
          (0, _utils.report)({
            message: messages.rejected(fullIdentifier),
            node: decl,
            index: match.startIndex,
            result: result,
            ruleName: ruleName
          });
        }
      });
    });
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "value-no-vendor-prefix";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(p) {
    return "Unexpected vendor-prefixed value \"" + p + "\"";
  }
});

var valuePrefixes = ["-webkit-", "-moz-", "-ms-", "-o-"];