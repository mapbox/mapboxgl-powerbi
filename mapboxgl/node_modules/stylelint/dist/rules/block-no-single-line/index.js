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

    // Check both kinds of statements: rules and at-rules
    root.walkRules(check);
    root.walkAtRules(check);

    function check(statement) {
      if (!(0, _utils.cssStatementHasBlock)(statement)) {
        return;
      }
      if (!(0, _utils.isSingleLineString)((0, _utils.cssStatementBlockString)(statement))) {
        return;
      }

      (0, _utils.report)({
        message: messages.rejected,
        node: statement,
        index: (0, _utils.cssStatementStringBeforeBlock)(statement, { noBefore: true }).length,
        result: result,
        ruleName: ruleName
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "block-no-single-line";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected single-line block"
});