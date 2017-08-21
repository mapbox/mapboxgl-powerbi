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

    root.walkRules(function (rule) {
      if ((0, _utils.cssRuleHasSelectorEndingWithColon)(rule)) {
        return;
      }
      (0, _postcssSelectorParser2.default)(function (selectorTree) {
        selectorTree.eachPseudo(function (pseudoNode) {
          if (_utils.isAutoprefixable.selector(pseudoNode.value)) {
            (0, _utils.report)({
              result: result,
              ruleName: ruleName,
              message: messages.rejected(pseudoNode.value),
              node: rule,
              index: rule.raws.before.length + pseudoNode.sourceIndex
            });
          }
        });
      }).process(rule.selector);
    });
  };
};

var _postcssSelectorParser = require("postcss-selector-parser");

var _postcssSelectorParser2 = _interopRequireDefault(_postcssSelectorParser);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "selector-no-vendor-prefix";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(p) {
    return "Unexpected vendor-prefixed selector \"" + p + "\"";
  }
});