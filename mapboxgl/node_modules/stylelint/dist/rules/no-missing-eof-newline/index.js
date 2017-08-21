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

    var sourceCss = root.toString();
    if (sourceCss === "") {
      return;
    }
    if (sourceCss.slice(-1) !== "\n") {
      (0, _utils.report)({
        message: messages.rejected,
        node: root,
        index: root.toString().length - 1,
        result: result,
        ruleName: ruleName
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "no-missing-eof-newline";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: "Unexpected missing newline at end of file"
});