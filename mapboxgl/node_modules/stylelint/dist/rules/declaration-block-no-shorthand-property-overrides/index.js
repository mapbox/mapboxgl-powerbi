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

    root.walkRules(check);
    root.walkAtRules(check);

    function check(statement) {
      var declarations = new Set();
      // Shallow iteration so nesting doesn't produce
      // false positives
      statement.each(function (node) {
        if (node.type !== "decl") {
          return;
        }
        var prop = node.prop;

        var overrideables = _shorthands2.default[prop];
        if (!overrideables) {
          declarations.add(prop);
          return;
        }
        overrideables.forEach(function (longhandProp) {
          if (declarations.has(longhandProp)) {
            (0, _utils.report)({
              ruleName: ruleName,
              result: result,
              node: node,
              message: messages.rejected(prop, longhandProp)
            });
          }
        });
      });
    }
  };
};

var _utils = require("../../utils");

var _shorthands = require("./shorthands");

var _shorthands2 = _interopRequireDefault(_shorthands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ruleName = exports.ruleName = "declaration-block-no-shorthand-property-overrides";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(shorthand, original) {
    return "Unexpected shorthand \"" + shorthand + "\" after \"" + original + "\"";
  }
});