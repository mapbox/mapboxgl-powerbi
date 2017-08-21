"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (on, options) {
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, { actual: on }, {
      optional: true,
      actual: options,
      possible: {
        browsers: [_lodash.isString],
        ignore: [_lodash.isString]
      }
    });
    if (!validOptions) {
      return;
    }

    var doiuseOptions = {};

    if (options && options.browsers) {
      doiuseOptions.browsers = options.browsers;
    }

    if (options && options.ignore) {
      doiuseOptions.ignore = options.ignore;
    }

    var doiuseResult = new _result2.default();
    doiuse(doiuseOptions).postcss(root, doiuseResult);
    doiuseResult.warnings().forEach(function (doiuseWarning) {
      (0, _utils.report)({
        ruleName: ruleName,
        result: result,
        message: messages.rejected(cleanDoiuseWarningText(doiuseWarning.text)),
        node: doiuseWarning.node,
        line: doiuseWarning.line,
        column: doiuseWarning.column
      });
    });
  };
};

var _result = require("postcss/lib/result");

var _result2 = _interopRequireDefault(_result);

var _lodash = require("lodash");

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var doiuse = require("doiuse");
var ruleName = exports.ruleName = "no-unsupported-browser-features";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(details) {
    return "Unexpected browser feature " + details;
  }
});

function cleanDoiuseWarningText(warningText) {
  return warningText.replace(/\s*\(\S+?\)$/, "");
}