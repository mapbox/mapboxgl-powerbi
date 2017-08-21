"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (quantity) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: quantity,
      possible: [_lodash.isNumber]
    });
    if (!validOptions) {
      return;
    }

    root.walkRules(function (rule) {

      if (!(0, _utils.isSingleLineString)((0, _utils.cssStatementBlockString)(rule))) {
        return;
      }

      var decls = rule.nodes.filter(function (node) {
        return node.type === "decl";
      });

      if (decls.length <= quantity) {
        return;
      }

      (0, _utils.report)({
        message: messages.expected(quantity),
        node: rule,
        index: (0, _utils.cssStatementStringBeforeBlock)(rule, { noBefore: true }).length,
        result: result,
        ruleName: ruleName
      });
    });
  };
};

var _lodash = require("lodash");

var _utils = require("../../utils");

var ruleName = exports.ruleName = "declaration-block-single-line-max-declarations";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expected: function expected(quantity) {
    return "Expected a maximum of " + quantity + " declaration(s)";
  }
});