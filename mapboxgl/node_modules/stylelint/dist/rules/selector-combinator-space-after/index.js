"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.ruleName = undefined;

exports.default = function (expectation) {
  var checker = (0, _utils.whitespaceChecker)("space", expectation, messages);
  return function (root, result) {
    var validOptions = (0, _utils.validateOptions)(result, ruleName, {
      actual: expectation,
      possible: ["always", "never"]
    });
    if (!validOptions) {
      return;
    }

    selectorCombinatorSpaceChecker({
      root: root,
      result: result,
      locationChecker: checker.after,
      checkedRuleName: ruleName
    });
  };
};

exports.selectorCombinatorSpaceChecker = selectorCombinatorSpaceChecker;

var _utils = require("../../utils");

var ruleName = exports.ruleName = "selector-combinator-space-after";

var messages = exports.messages = (0, _utils.ruleMessages)(ruleName, {
  expectedAfter: function expectedAfter(c) {
    return "Expected single space after \"" + c + "\" combinator ";
  },
  rejectedAfter: function rejectedAfter(c) {
    return "Unexpected whitespace after \"" + c + "\" combinator";
  }
});

var combinators = [">", "+", "~"];

function selectorCombinatorSpaceChecker(_ref) {
  var locationChecker = _ref.locationChecker;
  var root = _ref.root;
  var result = _ref.result;
  var checkedRuleName = _ref.checkedRuleName;

  root.walkRules(function (rule) {
    // Check each selector individually, instead of all as one string,
    // in case some that aren't the first begin with combinators (nesting syntax)
    rule.selectors.forEach(function (selector) {
      (0, _utils.styleSearch)({
        source: selector,
        target: combinators,
        outsideFunctionalNotation: true
      }, function (match) {
        // Catch ~= in attribute selectors
        if (match.target === "~" && selector[match.endIndex] === "=") {
          return;
        }

        check(selector, match.startIndex, rule);
      });
    });
  });

  function check(source, index, node) {
    locationChecker({ source: source, index: index, err: function err(m) {
        return (0, _utils.report)({
          message: m,
          node: node,
          index: index,
          result: result,
          ruleName: checkedRuleName
        });
      }
    });
  }
}