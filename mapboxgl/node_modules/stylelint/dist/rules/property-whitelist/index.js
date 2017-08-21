"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (whitelistInput) {
  var whitelist = [].concat(whitelistInput);
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: whitelist,
      possible: [_lodash.isString]
    });
    if (!validOptions) {
      return;
    }

    root.walkDecls(function (decl) {

      var prop = decl.prop;

      if ((0, _utils.cssWordIsVariable)(prop)) {
        return;
      }

      if (!(0, _utils.matchesStringOrRegExp)(_postcss.vendor.unprefixed(prop), whitelist)) {
        (0, _utils.report)({
          message: messages.rejected(prop),
          node: decl,
          result: result,
          ruleName: ruleName
        });
      }
    });
  };
};

var _postcss = require("postcss");

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "property-whitelist";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(p) {
    return "Unexpected property \"" + p + "\"";
  }
});