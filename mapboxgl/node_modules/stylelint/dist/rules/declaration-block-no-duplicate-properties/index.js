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

    // In order to accommodate nested blocks (postcss-nested),
    // we need to run a shallow loop (instead of eachDecl() or eachRule(),
    // which loop recursively) and allow each nested block to accumulate
    // its own list of properties -- so that a property in a nested rule
    // does not conflict with the same property in the parent rule
    root.each(function (node) {
      if (node.type === "rule" || node.type === "atrule") {
        checkRulesInNode(node);
      }
    });

    function checkRulesInNode(node) {
      var decls = [];
      node.each(function (child) {
        if (child.nodes && child.nodes.length) {
          checkRulesInNode(child);
        }
        if (child.type !== "decl") {
          return;
        }
        var prop = child.prop;

        if ((0, _utils.cssWordIsVariable)(prop)) {
          return;
        }

        // Ignore the src property as commonly duplicated in at-fontface
        if (prop === "src") {
          return;
        }

        if (decls.indexOf(prop) !== -1) {
          (0, _utils.report)({
            message: messages.rejected(prop),
            node: child,
            result: result,
            ruleName: ruleName
          });
        }
        decls.push(prop);
      });
    }
  };
};

var _utils = require("../../utils");

var ruleName = exports.ruleName = "declaration-block-no-duplicate-properties";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  rejected: function rejected(p) {
    return "Unexpected duplicate property \"" + p + "\"";
  }
});